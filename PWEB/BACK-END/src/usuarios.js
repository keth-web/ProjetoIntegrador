
const express = require('express');
const router = express.Router();

const {
    banco,
    verificarAdmin,
    exigirAdmin,
    admDAO,
    executarDAO
} = require('./funcoes');

const ADM = require('../../../POO/CoopRecicla/ADM');



router.post('/usuarios', async (req, res) => {
    const { cpf, nome, email, tel, senha, endereco } = req.body;

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

    let conexao;

    try {
        conexao = await banco.getConnection();

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
        if (conexao) {
            await conexao.rollback();
        }

        console.error('Erro no cadastro:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});



router.post('/login', async (req, res) => {
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



router.get('/usuarios', async (req, res) => {
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



router.get('/moradores/:cpf', async (req, res) => {
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



router.put('/moradores/:cpf', async (req, res) => {
    const { adminCpf, nome, email, tel, endereco } = req.body;

    let conexao;

    try {
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

        conexao = await banco.getConnection();

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
        if (conexao) {
            await conexao.rollback();
        }

        console.error('Erro ao editar morador:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar cadastro.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});



router.post('/administradores/promover', async (req, res) => {
    const { adminCpf, cpf } = req.body;

    try {
        if (!(await verificarAdmin(adminCpf))) {
            return res.status(403).json({
                mensagem: 'Somente um administrador ativo pode promover usuários.'
            });
        }

        if (!cpf) {
            return res.status(400).json({
                mensagem: 'Informe o CPF do usuário.'
            });
        }

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

module.exports = router;
