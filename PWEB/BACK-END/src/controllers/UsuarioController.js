const UsuarioDAO = require('../dao/UsuarioDAO');
const MoradorDAO = require('../dao/MoradorDAO');

class UsuarioController {

    cadastrar(req, res) {
        const { cpf, tel, nome, email, senha, endereco } = req.body;

        if (!cpf || !tel || !nome || !email || !senha || !endereco) {
            return res.status(400).json({
                mensagem: 'Preencha todos os campos.'
            });
        }

        const morador = {
            cpf,
            tel,
            nome,
            email,
            senha,
            endereco
        };

        const dao = new MoradorDAO();

        dao.cadastrar(morador, (erro) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao cadastrar usuário.',
                    erro: erro.message
                });
            }

            return res.status(201).json({
                mensagem: 'Cadastro realizado com sucesso!'
            });
        });
    }

    login(req, res) {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: 'Informe email e senha.'
            });
        }

        const dao = new UsuarioDAO();

        dao.buscarPorEmail(email, (erro, usuario) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao consultar usuário.'
                });
            }

            if (!usuario || usuario.senha !== senha) {
                return res.status(401).json({
                    mensagem: 'Email ou senha incorretos.'
                });
            }

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    cpf: usuario.cpf,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        });
    }
}

module.exports = UsuarioController;