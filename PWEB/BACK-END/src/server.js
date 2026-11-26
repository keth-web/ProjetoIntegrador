
const express = require('express');
const cors = require('cors');

const db = require('../conexao');
const banco = db.promise();

const app = express();
const PORTA = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// IMPORTAR DAOs
// =====================================

const PontoColetaDAO = require('../../POO/CoopRecicla/PontoColetaDAO');
const RecompensaDAO = require('../../POO/CoopRecicla/RecompensaDAO');
const MaterialDAO = require('../../POO/CoopRecicla/MaterialDAO');
const ItemEntregaDAO = require('../../POO/CoopRecicla/ItemEntregaDAO');
const ResgateDAO = require('../../POO/CoopRecicla/ResgateDAO');
const ADMDAO = require('../../POO/CoopRecicla/ADMDAO');

// =====================================
// IMPORTAR CLASSES
// =====================================

const PontoColeta = require('../../POO/CoopRecicla/PontoColeta');
const Recompensa = require('../../POO/CoopRecicla/Recompensa');
const Material = require('../../POO/CoopRecicla/Material');
const ItemEntrega = require('../../POO/CoopRecicla/ItemEntrega');
const Resgate = require('../../POO/CoopRecicla/Resgate');
const ADM = require('../../POO/CoopRecicla/ADM');

// =====================================
// INSTANCIAR DAOs
// =====================================

const pontoDAO = new PontoColetaDAO();
const recompensaDAO = new RecompensaDAO();
const materialDAO = new MaterialDAO();
const itemEntregaDAO = new ItemEntregaDAO();
const resgateDAO = new ResgateDAO();
const admDAO = new ADMDAO();

// Transformar callbacks dos DAOs em Promises
function executarDAO(dao, metodo, parametro) {
    return new Promise((resolve, reject) => {
        const callback = (erro, resultado) => {
            if (erro) {
                reject(erro);
            } else {
                resolve(resultado);
            }
        };

        if (parametro === undefined) {
            dao[metodo](callback);
        } else {
            dao[metodo](parametro, callback);
        }
    });
}

// =====================================
// VERIFICAR ADMINISTRADOR
// =====================================

async function verificarAdmin(cpf) {
    if (!cpf) return false;

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

    if (!/^\d{11}$/.test(String(cpf))) {
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
            'SELECT cpf FROM Usuario WHERE cpf = ? OR email = ?',
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
        console.error('Erro ao buscar morador:', erro);

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
            'SELECT cpf FROM Usuario WHERE email = ? AND cpf <> ?',
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

        console.error('Erro ao editar morador:', erro);

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

    try {
        const [usuarios] = await banco.query(
            'SELECT cpf, senha FROM Usuario WHERE cpf = ?',
            [cpf]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        const senhaUsuario = usuarios[0].senha;

        const adm = new ADM(cpf, true, senhaUsuario);

        const [admExistente] = await banco.query(
            'SELECT cpf FROM ADM WHERE cpf = ?',
            [cpf]
        );

        if (admExistente.length > 0) {
            await executarDAO(admDAO, 'atualizar', adm);
        } else {
            await executarDAO(admDAO, 'cadastrar', adm);
        }

        return res.json({
            mensagem: 'Usuário promovido a administrador com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao promover usuário:', erro);

        return res.status(500).json({
            mensagem: erro.message || 'Erro ao promover usuário.'
        });
    }
});

// =====================================
// PONTOS DE COLETA
// =====================================

// LISTAR
app.get('/pontos-coleta', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const pontos = await executarDAO(pontoDAO, 'listar');

        return res.json(pontos);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar pontos de coleta.'
        });
    }
});

// CADASTRAR
app.post('/pontos-coleta', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const { nome, end, tel } = req.body;

        const ponto = new PontoColeta(
            null,
            nome,
            end,
            tel || ''
        );

        const resultado = await executarDAO(
            pontoDAO,
            'cadastrar',
            ponto
        );

        return res.status(201).json({
            mensagem: 'Ponto de coleta cadastrado!',
            id: resultado.insertId
        });

    } catch (erro) {
        console.error(erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao cadastrar ponto.'
        });
    }
});

// ATUALIZAR
app.put('/pontos-coleta/:id', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const id = Number(req.params.id);
        const { nome, end, tel } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const ponto = new PontoColeta(
            id,
            nome,
            end,
            tel || ''
        );

        const resultado = await executarDAO(
            pontoDAO,
            'atualizar',
            ponto
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
        console.error(erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao atualizar ponto.'
        });
    }
});

// EXCLUIR
app.delete('/pontos-coleta/:id', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const resultado = await executarDAO(
            pontoDAO,
            'excluir',
            Number(req.params.id)
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
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Não foi possível remover o ponto. Verifique se existem entregas vinculadas.'
        });
    }
});

// =====================================
// RECOMPENSAS
// =====================================

// LISTAR
app.get('/recompensas', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const recompensas = await executarDAO(
            recompensaDAO,
            'listar'
        );

        return res.json(recompensas);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar recompensas.'
        });
    }
});

// CADASTRAR
app.post('/recompensas', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const {
            cod_recomp,
            registro_pontos,
            catalogo
        } = req.body;

        const recompensa = new Recompensa(
            cod_recomp,
            Number(registro_pontos),
            catalogo
        );

        const resultado = await executarDAO(
            recompensaDAO,
            'cadastrar',
            recompensa
        );

        return res.status(201).json({
            mensagem: 'Recompensa cadastrada!',
            resultado
        });

    } catch (erro) {
        console.error(erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao cadastrar recompensa.'
        });
    }
});

// ATUALIZAR
app.put('/recompensas/:codigo', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const recompensa = new Recompensa(
            req.params.codigo,
            Number(req.body.registro_pontos),
            req.body.catalogo
        );

        const resultado = await executarDAO(
            recompensaDAO,
            'atualizar',
            recompensa
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

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao atualizar recompensa.'
        });
    }
});

// EXCLUIR
app.delete('/recompensas/:codigo', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const resultado = await executarDAO(
            recompensaDAO,
            'excluir',
            req.params.codigo
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
// MATERIAIS
// =====================================

app.get('/materiais', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const materiais = await executarDAO(
            materialDAO,
            'listar'
        );

        return res.json(materiais);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar materiais.'
        });
    }
});

app.post('/materiais', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const material = new Material(
            req.body.cod_m,
            req.body.tipo,
            Number(req.body.ponto_kg)
        );

        await executarDAO(
            materialDAO,
            'cadastrar',
            material
        );

        return res.status(201).json({
            mensagem: 'Material cadastrado!'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao cadastrar material.'
        });
    }
});

// =====================================
// ITENS DE ENTREGA
// =====================================

app.get('/itens-entrega', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const itens = await executarDAO(
            itemEntregaDAO,
            'listar'
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
// RESGATES
// =====================================

app.get('/resgates', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const resgates = await executarDAO(
            resgateDAO,
            'listar'
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
// RELATÓRIOS
// =====================================

app.get('/relatorios', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const [materiais] = await banco.query(
            `SELECT
                m.cod_m,
                m.tipo,
                SUM(ie.kg) AS total_kg,
                SUM(ie.kg * m.ponto_kg) AS total_pontos
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
