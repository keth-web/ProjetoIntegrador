
const express = require('express');
const router = express.Router();

const {
    pontoDAO,
    executarDAO,
    exigirAdmin
} = require('./funcoes');

const PontoColeta = require('../../../POO/CoopRecicla/PontoColeta');



router.get('/pontos-coleta', async (req, res) => {
    try {
        const pontos = await executarDAO(pontoDAO, 'listar');

        return res.json(pontos);

    } catch (erro) {
        console.error('Erro ao listar pontos:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar pontos de coleta.'
        });
    }
});



router.post('/pontos-coleta', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const { nome, end, tel } = req.body;

        if (!nome || !end) {
            return res.status(400).json({
                mensagem: 'Informe o nome e o endereço.'
            });
        }

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
        console.error('Erro ao cadastrar ponto:', erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao cadastrar ponto.'
        });
    }
});


router.put('/pontos-coleta/:id', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const id = Number(req.params.id);
        const { nome, end, tel } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        if (!nome || !end) {
            return res.status(400).json({
                mensagem: 'Informe o nome e o endereço.'
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
        console.error('Erro ao atualizar ponto:', erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao atualizar ponto.'
        });
    }
});



router.delete('/pontos-coleta/:id', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const resultado = await executarDAO(
            pontoDAO,
            'excluir',
            id
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

module.exports = router;
