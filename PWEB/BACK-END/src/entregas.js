
const express = require('express');
const router = express.Router();

const {
    itemEntregaDAO,
    resgateDAO,
    executarDAO,
    exigirAdmin
} = require('./funcoes');



router.get('/itens-entrega', async (req, res) => {
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



router.get('/resgates', async (req, res) => {
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

module.exports = router;
