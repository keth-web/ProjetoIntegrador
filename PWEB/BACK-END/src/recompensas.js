
const express = require('express');
const router = express.Router();

const {
    recompensaDAO,
    executarDAO,
    exigirAdmin
} = require('./funcoes');

const Recompensa = require('../../../POO/CoopRecicla/Recompensa');


router.get('/recompensas', async (req, res) => {
    try {
        const recompensas = await executarDAO(
            recompensaDAO,
            'listar'
        );

        return res.status(200).json(recompensas);

    } catch (erro) {
        console.error('Erro ao listar recompensas:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar recompensas.'
        });
    }
});



router.post('/recompensas', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) {
            return;
        }

        const {
            cod_recomp,
            registro_pontos,
            catalogo
        } = req.body;

        if (
            !cod_recomp ||
            !catalogo ||
            registro_pontos === undefined ||
            !Number.isFinite(Number(registro_pontos)) ||
            Number(registro_pontos) <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe um código, um nome e uma pontuação válida.'
            });
        }

        const recompensa = new Recompensa(
            cod_recomp,
            Number(registro_pontos),
            catalogo.trim()
        );

        const resultado = await executarDAO(
            recompensaDAO,
            'cadastrar',
            recompensa
        );

        return res.status(201).json({
            mensagem: 'Recompensa cadastrada com sucesso!',
            resultado
        });

    } catch (erro) {
        console.error('Erro ao cadastrar recompensa:', erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Já existe uma recompensa com esse código.'
            });
        }

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao cadastrar recompensa.'
        });
    }
});



router.put('/recompensas/:codigo', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) {
            return;
        }

        const { registro_pontos, catalogo } = req.body;

        if (
            !catalogo ||
            registro_pontos === undefined ||
            !Number.isFinite(Number(registro_pontos)) ||
            Number(registro_pontos) <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe um nome e uma pontuação válida.'
            });
        }

        const recompensa = new Recompensa(
            req.params.codigo,
            Number(registro_pontos),
            catalogo.trim()
        );

        const resultado = await executarDAO(
            recompensaDAO,
            'atualizar',
            recompensa
        );

        if (!resultado || resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Recompensa não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Recompensa atualizada com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao atualizar recompensa:', erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao atualizar recompensa.'
        });
    }
});



router.delete('/recompensas/:codigo', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) {
            return;
        }

        const resultado = await executarDAO(
            recompensaDAO,
            'excluir',
            req.params.codigo
        );

        if (!resultado || resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Recompensa não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Recompensa removida com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao excluir recompensa:', erro);

        return res.status(500).json({
            mensagem: 'Não foi possível remover a recompensa. Verifique se existem resgates vinculados.'
        });
    }
});

module.exports = router;
