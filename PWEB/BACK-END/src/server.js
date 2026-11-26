
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const db = require('../conexao');
const banco = db.promise();

const app = express();
const PORTA = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// FUNÇÕES AUXILIARES
// =====================================

function gerarCodigo() {
    return crypto.randomBytes(8)
        .toString('hex')
        .substring(0, 9)
        .toUpperCase();
}

function gerarCodigoRecompensa() {
    return 'R' + crypto.randomBytes(4)
        .toString('hex')
        .substring(0, 8)
        .toUpperCase();
}

function gerarCodigoEntrega() {
    return 'E' + crypto.randomBytes(4)
        .toString('hex')
        .substring(0, 8)
        .toUpperCase();
}

function gerarCodigoItem() {
    return 'I' + crypto.randomBytes(4)
        .toString('hex')
        .substring(0, 8)
        .toUpperCase();
}

function cpfValido(cpf) {
    return /^\d{11}$/.test(String(cpf || ''));
}

// =====================================
// VERIFICAR ADMINISTRADOR
// =====================================

async function verificarAdmin(cpf) {
    if (!cpfValido(cpf)) return false;

    const [resultado] = await banco.query(
        `SELECT cpf
         FROM ADM
         WHERE cpf = ? AND status_adm = TRUE`,
        [cpf]
    );

    return resultado.length > 0;
}

async function exigirAdmin(req, res) {
    const adminCpf = req.body.adminCpf || req.query.adminCpf;

    if (!(await verificarAdmin(adminCpf))) {
        res.status(403).json({
            mensagem: 'Acesso permitido somente para administradores ativos.'
        });

        return false;
    }

    return true;
}

// =====================================
// ROTA INICIAL
// =====================================

app.get('/', (req, res) => {
    res.send('Servidor CoopRecicla funcionando!');
});

// =====================================
// CADASTRAR USUÁRIO
// =====================================

app.post('/usuarios', async (req, res) => {
    const {
        cpf,
        nome,
        email,
        tel,
        senha,
        endereco
    } = req.body;

    if (!cpf || !nome || !email || !tel || !senha || !endereco) {
        return res.status(400).json({
            mensagem: 'Preencha todos os campos obrigatórios.'
        });
    }

    if (!cpfValido(cpf)) {
        return res.status(400).json({
            mensagem: 'CPF deve conter 11 números.'
        });
    }

    if (String(senha).length !== 8) {
        return res.status(400).json({
            mensagem: 'A senha deve possuir 8 caracteres.'
        });
    }

    const conexao = await banco.getConnection();

    try {
        await conexao.beginTransaction();

        const [existente] = await conexao.query(
            `SELECT cpf
             FROM Usuario
             WHERE cpf = ? OR email = ?`,
            [cpf, email]
        );

        if (existente.length > 0) {
            await conexao.rollback();

            return res.status(409).json({
                mensagem: 'CPF ou e-mail já cadastrado.'
            });
        }

        await conexao.query(
            `INSERT INTO Usuario
             (cpf, nome, email, tel, senha)
             VALUES (?, ?, ?, ?, ?)`,
            [cpf, nome, email, tel, senha]
        );

        await conexao.query(
            `INSERT INTO Morador
             (cpf, endereco, pontos, senha)
             VALUES (?, ?, 0, ?)`,
            [cpf, endereco, senha]
        );

        await conexao.commit();

        return res.status(201).json({
            mensagem: 'Morador cadastrado com sucesso!'
        });

    } catch (erro) {
        await conexao.rollback();

        console.error('Erro no cadastro:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário.'
        });

    } finally {
        conexao.release();
    }
});

// =====================================
// LOGIN
// =====================================

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: 'Informe o e-mail e a senha.'
        });
    }

    try {
        const [usuarios] = await banco.query(
            `SELECT
                u.cpf,
                u.nome,
                u.email,
                u.senha,
                a.status_adm,
                m.cpf AS cpf_morador
             FROM Usuario u
             LEFT JOIN ADM a ON a.cpf = u.cpf
             LEFT JOIN Morador m ON m.cpf = u.cpf
             WHERE u.email = ?
             LIMIT 1`,
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        const usuario = usuarios[0];

        if (String(usuario.senha) !== String(senha)) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        let perfil = '';

        if (
            usuario.status_adm !== null &&
            Number(usuario.status_adm) === 1
        ) {
            perfil = 'ADM';

        } else if (usuario.cpf_morador) {
            perfil = 'MORADOR';

        } else {
            return res.status(403).json({
                mensagem: 'Usuário sem perfil ativo.'
            });
        }

        return res.json({
            mensagem: 'Login realizado com sucesso!',
            cpf: usuario.cpf,
            nome: usuario.nome,
            email: usuario.email,
            perfil
        });

    } catch (erro) {
        console.error('Erro no login:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao realizar login.'
        });
    }
});

// =====================================
// LISTAR USUÁRIOS
// =====================================

app.get('/usuarios', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const [usuarios] = await banco.query(
            `SELECT
                u.cpf,
                u.nome,
                u.email,
                u.tel,
                m.endereco,
                m.pontos,
                a.status_adm,
                CASE
                    WHEN a.cpf IS NOT NULL
                         AND a.status_adm = TRUE THEN 'ADM'
                    WHEN m.cpf IS NOT NULL THEN 'MORADOR'
                    ELSE 'SEM PERFIL'
                END AS perfil
             FROM Usuario u
             LEFT JOIN Morador m ON m.cpf = u.cpf
             LEFT JOIN ADM a ON a.cpf = u.cpf
             WHERE
                m.cpf IS NOT NULL
                OR (a.cpf IS NOT NULL AND a.status_adm = TRUE)
             ORDER BY u.nome ASC`
        );

        return res.json(usuarios);

    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao buscar usuários.'
        });
    }
});

// =====================================
// BUSCAR MORADOR
// =====================================

app.get('/moradores/:cpf', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const [moradores] = await banco.query(
            `SELECT
                u.cpf,
                u.nome,
                u.email,
                u.tel,
                m.endereco,
                m.pontos
             FROM Usuario u
             INNER JOIN Morador m ON m.cpf = u.cpf
             WHERE u.cpf = ?`,
            [req.params.cpf]
        );

        if (moradores.length === 0) {
            return res.status(404).json({
                mensagem: 'Morador não encontrado.'
            });
        }

        return res.json(moradores[0]);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao buscar cadastro.'
        });
    }
});

// =====================================
// EDITAR MORADOR
// =====================================

app.put('/moradores/:cpf', async (req, res) => {
    const {
        adminCpf,
        nome,
        email,
        tel,
        endereco
    } = req.body;

    if (!(await verificarAdmin(adminCpf))) {
        return res.status(403).json({
            mensagem: 'Acesso permitido somente para administradores.'
        });
    }

    if (!nome || !email || !tel || !endereco) {
        return res.status(400).json({
            mensagem: 'Preencha todos os campos.'
        });
    }

    const conexao = await banco.getConnection();

    try {
        await conexao.beginTransaction();

        const cpf = req.params.cpf;

        const [existente] = await conexao.query(
            'SELECT cpf FROM Morador WHERE cpf = ?',
            [cpf]
        );

        if (existente.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Morador não encontrado.'
            });
        }

        const [emailExistente] = await conexao.query(
            `SELECT cpf
             FROM Usuario
             WHERE email = ? AND cpf <> ?`,
            [email, cpf]
        );

        if (emailExistente.length > 0) {
            await conexao.rollback();

            return res.status(409).json({
                mensagem: 'Este e-mail já está sendo utilizado.'
            });
        }

        await conexao.query(
            `UPDATE Usuario
             SET nome = ?, email = ?, tel = ?
             WHERE cpf = ?`,
            [nome, email, tel, cpf]
        );

        await conexao.query(
            'UPDATE Morador SET endereco = ? WHERE cpf = ?',
            [endereco, cpf]
        );

        await conexao.commit();

        return res.json({
            mensagem: 'Cadastro atualizado com sucesso!'
        });

    } catch (erro) {
        await conexao.rollback();

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar cadastro.'
        });

    } finally {
        conexao.release();
    }
});

// =====================================
// PROMOVER MORADOR PARA ADM
// =====================================

app.post('/administradores/promover', async (req, res) => {
    const { adminCpf, cpf } = req.body;

    if (!(await verificarAdmin(adminCpf))) {
        return res.status(403).json({
            mensagem: 'Somente um administrador ativo pode promover usuários.'
        });
    }

    if (!cpfValido(cpf)) {
        return res.status(400).json({
            mensagem: 'CPF inválido.'
        });
    }

    try {
        const [usuarios] = await banco.query(
            'SELECT cpf FROM Usuario WHERE cpf = ?',
            [cpf]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        const [existente] = await banco.query(
            'SELECT cpf FROM ADM WHERE cpf = ?',
            [cpf]
        );

        if (existente.length > 0) {
            await banco.query(
                'UPDATE ADM SET status_adm = TRUE WHERE cpf = ?',
                [cpf]
            );

        } else {
            const [usuario] = await banco.query(
                'SELECT senha FROM Usuario WHERE cpf = ?',
                [cpf]
            );

            await banco.query(
                `INSERT INTO ADM (cpf, status_adm, senha)
                 VALUES (?, TRUE, ?)`,
                [cpf, usuario[0].senha]
            );
        }

        return res.json({
            mensagem: 'Usuário promovido a administrador com sucesso!'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao promover usuário.'
        });
    }
});

// =====================================
// PONTOS DE COLETA
// =====================================

// LISTAR PONTOS
app.get('/pontos-coleta', async (req, res) => {
    try {
        const [pontos] = await banco.query(
            `SELECT
                id,
                nome,
                ende,
                ende AS endereco,
                ende AS \`end\`,
                tel
             FROM ponto_coleta
             ORDER BY nome`
        );

        return res.json(pontos);

    } catch (erro) {
        console.error('Erro ao listar pontos:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar pontos de coleta.'
        });
    }
});

// CADASTRAR PONTO
app.post('/pontos-coleta', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const nome = req.body.nome;
        const endereco =
            req.body.endereco ||
            req.body.ende ||
            req.body.end;

        const tel = req.body.tel || '';

        if (!nome || !endereco) {
            return res.status(400).json({
                mensagem: 'Informe o nome e o endereço do ponto.'
            });
        }

        const [resultado] = await banco.query(
            `INSERT INTO ponto_coleta
             (nome, ende, tel)
             VALUES (?, ?, ?)`,
            [nome, endereco, tel]
        );

        return res.status(201).json({
            mensagem: 'Ponto de coleta cadastrado!',
            id: resultado.insertId
        });

    } catch (erro) {
        console.error('Erro ao cadastrar ponto:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar ponto.'
        });
    }
});

// ATUALIZAR PONTO
app.put('/pontos-coleta/:id', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const nome = req.body.nome;

        const endereco =
            req.body.endereco ||
            req.body.ende ||
            req.body.end;

        const tel = req.body.tel || '';

        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0 ||
            !nome ||
            !endereco
        ) {
            return res.status(400).json({
                mensagem: 'Dados inválidos para atualizar o ponto.'
            });
        }

        const [resultado] = await banco.query(
            `UPDATE ponto_coleta
             SET nome = ?, ende = ?, tel = ?
             WHERE id = ?`,
            [nome, endereco, tel, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Ponto não encontrado.'
            });
        }

        return res.json({
            mensagem: 'Ponto atualizado com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao atualizar ponto:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar ponto.'
        });
    }
});

// EXCLUIR PONTO
app.delete('/pontos-coleta/:id', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID do ponto inválido.'
            });
        }

        const [resultado] = await banco.query(
            'DELETE FROM ponto_coleta WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Ponto não encontrado.'
            });
        }

        return res.json({
            mensagem: 'Ponto removido com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao excluir ponto:', erro);

        return res.status(500).json({
            mensagem: 'Não foi possível remover o ponto. Verifique se existem entregas vinculadas.'
        });
    }
});

// =====================================
// MATERIAIS
// =====================================

// LISTAR MATERIAIS
app.get('/materiais', async (req, res) => {
    try {
        const [materiais] = await banco.query(
            `SELECT cod_m, tipo, ponto_kg
             FROM material
             ORDER BY tipo`
        );

        return res.json(materiais);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar materiais.'
        });
    }
});

// CADASTRAR MATERIAL
app.post('/materiais', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const { cod_m, tipo, ponto_kg } = req.body;

        if (
            !cod_m ||
            !tipo ||
            !Number.isFinite(Number(ponto_kg)) ||
            Number(ponto_kg) <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe os dados válidos do material.'
            });
        }

        await banco.query(
            `INSERT INTO material
             (cod_m, tipo, ponto_kg)
             VALUES (?, ?, ?)`,
            [cod_m, tipo, Number(ponto_kg)]
        );

        return res.status(201).json({
            mensagem: 'Material cadastrado!'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(400).json({
            mensagem: 'Erro ao cadastrar material.'
        });
    }
});

// =====================================
// RECOMPENSAS
// =====================================

// LISTAR RECOMPENSAS
app.get('/recompensas', async (req, res) => {
    try {
        const [recompensas] = await banco.query(
            `SELECT cod_recomp, registro_pontos, catalogo
             FROM recompensa
             ORDER BY registro_pontos`
        );

        return res.json(recompensas);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar recompensas.'
        });
    }
});

// CADASTRAR RECOMPENSA
app.post('/recompensas', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const {
            cod_recomp,
            registro_pontos,
            catalogo
        } = req.body;

        if (
            !cod_recomp ||
            !catalogo ||
            !Number.isFinite(Number(registro_pontos)) ||
            Number(registro_pontos) <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe os dados válidos da recompensa.'
            });
        }

        await banco.query(
            `INSERT INTO recompensa
             (cod_recomp, registro_pontos, catalogo)
             VALUES (?, ?, ?)`,
            [cod_recomp, Number(registro_pontos), catalogo]
        );

        return res.status(201).json({
            mensagem: 'Recompensa cadastrada!'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(400).json({
            mensagem: 'Erro ao cadastrar recompensa.'
        });
    }
});

// ATUALIZAR RECOMPENSA
app.put('/recompensas/:codigo', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const { registro_pontos, catalogo } = req.body;

        if (
            !catalogo ||
            !Number.isFinite(Number(registro_pontos)) ||
            Number(registro_pontos) <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe os dados da recompensa.'
            });
        }

        const [resultado] = await banco.query(
            `UPDATE recompensa
             SET registro_pontos = ?, catalogo = ?
             WHERE cod_recomp = ?`,
            [
                Number(registro_pontos),
                catalogo,
                req.params.codigo
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Recompensa não encontrada.'
            });
        }

        return res.json({
            mensagem: 'Recompensa atualizada!'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar recompensa.'
        });
    }
});

// EXCLUIR RECOMPENSA
app.delete('/recompensas/:codigo', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const [resultado] = await banco.query(
            'DELETE FROM recompensa WHERE cod_recomp = ?',
            [req.params.codigo]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Recompensa não encontrada.'
            });
        }

        return res.json({
            mensagem: 'Recompensa removida!'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Não foi possível remover a recompensa. Verifique se existem resgates vinculados.'
        });
    }
});

// =====================================
// RESUMO DO MORADOR
// =====================================

app.get('/moradores/:cpf/resumo', async (req, res) => {
    try {
        const cpf = req.params.cpf;

        const [moradores] = await banco.query(
            `SELECT
                u.cpf,
                u.nome,
                u.email,
                m.pontos
             FROM Usuario u
             INNER JOIN Morador m ON m.cpf = u.cpf
             WHERE u.cpf = ?`,
            [cpf]
        );

        if (moradores.length === 0) {
            return res.status(404).json({
                mensagem: 'Morador não encontrado.'
            });
        }

        const [estatisticas] = await banco.query(
            `SELECT
                COUNT(DISTINCT e.cod_entrega) AS total_entregas,
                COALESCE(SUM(ie.kg), 0) AS total_kg
             FROM entrega e
             LEFT JOIN item_entrega ie
                ON ie.cod_entrega = e.cod_entrega
             WHERE e.cpf = ?`,
            [cpf]
        );

        return res.json({
            ...moradores[0],
            total_entregas: Number(estatisticas[0].total_entregas),
            total_kg: Number(estatisticas[0].total_kg)
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao carregar resumo do morador.'
        });
    }
});

// =====================================
// REGISTRAR ENTREGA
// =====================================

app.post('/entregas', async (req, res) => {
    const { cpf, id, itens } = req.body;

    if (
        !cpfValido(cpf) ||
        !id ||
        !Array.isArray(itens) ||
        itens.length === 0
    ) {
        return res.status(400).json({
            mensagem: 'Informe o morador, o ponto de coleta e os materiais.'
        });
    }

    const conexao = await banco.getConnection();

    try {
        await conexao.beginTransaction();

        const [moradores] = await conexao.query(
            'SELECT cpf FROM Morador WHERE cpf = ?',
            [cpf]
        );

        if (moradores.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Morador não encontrado.'
            });
        }

        const [pontos] = await conexao.query(
            'SELECT id FROM ponto_coleta WHERE id = ?',
            [id]
        );

        if (pontos.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Ponto de coleta não encontrado.'
            });
        }

        let totalPontos = 0;
        const itensValidados = [];

        for (const item of itens) {
            const kg = Number(item.kg);

            if (!item.cod_m || !Number.isFinite(kg) || kg <= 0) {
                await conexao.rollback();

                return res.status(400).json({
                    mensagem: 'Existe um material ou peso inválido.'
                });
            }

            const [materiaisEncontrados] = await conexao.query(
                `SELECT cod_m, tipo, ponto_kg
                 FROM material
                 WHERE cod_m = ?`,
                [item.cod_m]
            );

            if (materiaisEncontrados.length === 0) {
                await conexao.rollback();

                return res.status(404).json({
                    mensagem: `Material ${item.cod_m} não encontrado.`
                });
            }

            const material = materiaisEncontrados[0];

            const pontosItem = Math.round(
                kg * Number(material.ponto_kg)
            );

            totalPontos += pontosItem;

            itensValidados.push({
                cod_m: material.cod_m,
                kg,
                pontos: pontosItem
            });
        }

        const codEntrega = gerarCodigoEntrega();

        await conexao.query(
            `INSERT INTO entrega
             (id, cpf, cod_entrega, hora, total_pontos, data_a)
             VALUES (?, ?, ?, CURTIME(), ?, CURDATE())`,
            [id, cpf, codEntrega, totalPontos]
        );

        for (const item of itensValidados) {
            await conexao.query(
                `INSERT INTO item_entrega
                 (cod_m, cod_entrega, codigoE, kg)
                 VALUES (?, ?, ?, ?)`,
                [
                    item.cod_m,
                    codEntrega,
                    gerarCodigoItem(),
                    item.kg
                ]
            );
        }

        await conexao.query(
            `UPDATE Morador
             SET pontos = pontos + ?
             WHERE cpf = ?`,
            [totalPontos, cpf]
        );

        await conexao.commit();

        return res.status(201).json({
            mensagem: 'Entrega registrada com sucesso!',
            cod_entrega: codEntrega,
            total_pontos: totalPontos
        });

    } catch (erro) {
        await conexao.rollback();

        console.error('Erro ao registrar entrega:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao registrar entrega.'
        });

    } finally {
        conexao.release();
    }
});

// =====================================
// HISTÓRICO DE ENTREGAS DO MORADOR
// =====================================

app.get('/moradores/:cpf/entregas', async (req, res) => {
    try {
        const cpf = req.params.cpf;

        const [entregas] = await banco.query(
            `SELECT
                e.cod_entrega,
                e.data_a,
                e.hora,
                e.total_pontos,
                p.nome AS ponto_nome
             FROM entrega e
             INNER JOIN ponto_coleta p ON p.id = e.id
             WHERE e.cpf = ?
             ORDER BY e.data_a DESC, e.hora DESC`,
            [cpf]
        );

        for (const entrega of entregas) {
            const [itens] = await banco.query(
                `SELECT
                    ie.cod_m,
                    ie.kg,
                    m.tipo
                 FROM item_entrega ie
                 INNER JOIN material m ON m.cod_m = ie.cod_m
                 WHERE ie.cod_entrega = ?`,
                [entrega.cod_entrega]
            );

            entrega.itens = itens;
        }

        return res.json(entregas);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao buscar entregas.'
        });
    }
});

// =====================================
// REALIZAR RESGATE
// =====================================

app.post('/resgates', async (req, res) => {
    const { cpf, cod_recomp } = req.body;

    if (!cpfValido(cpf) || !cod_recomp) {
        return res.status(400).json({
            mensagem: 'Informe o morador e a recompensa.'
        });
    }

    const conexao = await banco.getConnection();

    try {
        await conexao.beginTransaction();

        const [moradores] = await conexao.query(
            `SELECT pontos
             FROM Morador
             WHERE cpf = ?
             FOR UPDATE`,
            [cpf]
        );

        if (moradores.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Morador não encontrado.'
            });
        }

        const [recompensas] = await conexao.query(
            `SELECT cod_recomp, registro_pontos, catalogo
             FROM recompensa
             WHERE cod_recomp = ?`,
            [cod_recomp]
        );

        if (recompensas.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Recompensa não encontrada.'
            });
        }

        const saldo = Number(moradores[0].pontos);
        const recompensa = recompensas[0];
        const custo = Number(recompensa.registro_pontos);

        if (saldo < custo) {
            await conexao.rollback();

            return res.status(400).json({
                mensagem: 'Você não possui pontos suficientes.'
            });
        }

        const codigoResgate = gerarCodigo();

        await conexao.query(
            `INSERT INTO resgate
             (cod_recomp, cpf, cod_resg, data_resg)
             VALUES (?, ?, ?, CURDATE())`,
            [cod_recomp, cpf, codigoResgate]
        );

        await conexao.query(
            `UPDATE Morador
             SET pontos = pontos - ?
             WHERE cpf = ?`,
            [custo, cpf]
        );

        await conexao.commit();

        return res.status(201).json({
            mensagem: 'Resgate realizado com sucesso!',
            cod_resg: codigoResgate,
            pontos_utilizados: custo
        });

    } catch (erro) {
        await conexao.rollback();

        console.error('Erro ao realizar resgate:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao realizar resgate.'
        });

    } finally {
        conexao.release();
    }
});

// =====================================
// HISTÓRICO DE RESGATES DO MORADOR
// =====================================

app.get('/moradores/:cpf/resgates', async (req, res) => {
    try {
        const [resgates] = await banco.query(
            `SELECT
                r.cod_resg,
                r.data_resg,
                r.cod_recomp,
                rec.catalogo,
                rec.registro_pontos AS pontos
             FROM resgate r
             INNER JOIN recompensa rec
                ON rec.cod_recomp = r.cod_recomp
             WHERE r.cpf = ?
             ORDER BY r.data_resg DESC`,
            [req.params.cpf]
        );

        return res.json(resgates);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao buscar resgates.'
        });
    }
});

// =====================================
// LISTAR ITENS DE ENTREGA - ADM
// =====================================

app.get('/itens-entrega', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const [itens] = await banco.query(
            `SELECT
                ie.cod_m,
                ie.cod_entrega,
                ie.codigoE,
                ie.kg,
                m.tipo
             FROM item_entrega ie
             INNER JOIN material m ON m.cod_m = ie.cod_m
             ORDER BY ie.cod_entrega`
        );

        return res.json(itens);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar itens de entrega.'
        });
    }
});

// =====================================
// LISTAR RESGATES - ADM
// =====================================

app.get('/resgates', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const [resgates] = await banco.query(
            `SELECT
                r.cod_resg,
                r.cod_recomp,
                r.cpf,
                r.data_resg,
                rec.catalogo,
                rec.registro_pontos
             FROM resgate r
             INNER JOIN recompensa rec
                ON rec.cod_recomp = r.cod_recomp
             ORDER BY r.data_resg DESC`
        );

        return res.json(resgates);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar resgates.'
        });
    }
});

// =====================================
// RELATÓRIOS - ADM
// =====================================

app.get('/relatorios', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const [materiais] = await banco.query(
            `SELECT
                m.cod_m,
                m.tipo,
                COALESCE(SUM(ie.kg), 0) AS total_kg,
                COALESCE(SUM(ie.kg * m.ponto_kg), 0) AS total_pontos
             FROM material m
             LEFT JOIN item_entrega ie ON ie.cod_m = m.cod_m
             GROUP BY m.cod_m, m.tipo
             ORDER BY m.tipo`
        );

        const [entregas] = await banco.query(
            `SELECT
                COUNT(*) AS total_entregas,
                COALESCE(SUM(total_pontos), 0) AS pontos_gerados
             FROM entrega`
        );

        const [moradores] = await banco.query(
            `SELECT
                u.nome,
                m.cpf,
                m.pontos,
                COUNT(e.cod_entrega) AS total_entregas
             FROM Morador m
             INNER JOIN Usuario u ON u.cpf = m.cpf
             LEFT JOIN entrega e ON e.cpf = m.cpf
             GROUP BY u.nome, m.cpf, m.pontos
             ORDER BY total_entregas DESC, m.pontos DESC
             LIMIT 10`
        );

        const [pontosColeta] = await banco.query(
            'SELECT COUNT(*) AS total FROM ponto_coleta'
        );

        const [recompensas] = await banco.query(
            'SELECT COUNT(*) AS total FROM recompensa'
        );

        const [resgates] = await banco.query(
            'SELECT COUNT(*) AS total FROM resgate'
        );

        return res.json({
            materiais,
            entregas: entregas[0],
            moradores,
            totalPontosColeta: pontosColeta[0].total,
            totalRecompensas: recompensas[0].total,
            totalResgates: resgates[0].total
        });

    } catch (erro) {
        console.error('Erro nos relatórios:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao gerar relatórios.'
        });
    }
});

// =====================================
// INICIAR SERVIDOR
// =====================================

app.listen(PORTA, () => {
    console.log(
        `Servidor CoopRecicla rodando em http://localhost:${PORTA}`
    );
});
