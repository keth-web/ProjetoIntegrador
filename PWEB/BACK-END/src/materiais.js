
const express = require('express');
const router = express.Router();

const {
    materialDAO,
    executarDAO,
    exigirAdmin
} = require('./funcoes');

const Material = require('../../../POO/CoopRecicla/Material');

// ========================================
// LISTAR MATERIAIS
// Moradores e administradores podem consultar
// ========================================

router.get('/materiais', async (req, res) => {
    try {
        const materiais = await executarDAO(
            materialDAO,
            'listar'
        );

        return res.status(200).json(materiais);

    } catch (erro) {
        console.error('Erro ao listar materiais:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar materiais.'
        });
    }
});

// ========================================
// CADASTRAR MATERIAL
// Somente administradores podem cadastrar
// ========================================

router.post('/materiais', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) {
            return;
        }

        const {
            cod_m,
            tipo,
            ponto_kg
        } = req.body;

        if (!cod_m || !tipo || ponto_kg === undefined) {
            return res.status(400).json({
                mensagem: 'Preencha todos os campos.'
            });
        }

        if (
            !Number.isFinite(Number(ponto_kg)) ||
            Number(ponto_kg) <= 0
        ) {
            return res.status(400).json({
                mensagem: 'A pontuação por kg deve ser maior que zero.'
            });
        }

        const material = new Material(
            cod_m,
            tipo,
            Number(ponto_kg)
        );

        const resultado = await executarDAO(
            materialDAO,
            'cadastrar',
            material
        );

        return res.status(201).json({
            mensagem: 'Material cadastrado com sucesso!',
            resultado
        });

    } catch (erro) {
        console.error('Erro ao cadastrar material:', erro);

        return res.status(400).json({
            mensagem: erro.message || 'Erro ao cadastrar material.'
        });
    }
});

// ========================================
// EXPORTAR ROTAS
// ========================================

module.exports = router;
