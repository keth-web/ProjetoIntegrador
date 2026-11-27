
const express = require('express');
const router = express.Router();

const {
    banco,
    exigirAdmin
} = require('./funcoes');

// ========================================
// RESUMO DO MORADOR
// ========================================

router.get('/moradores/:cpf/resumo', async (req, res) => {

    try {
        const { cpf } = req.params;

        // Buscar saldo e totais do morador
        const [resultado] = await banco.query(
            `SELECT
                m.cpf,
                m.pontos,

                COUNT(DISTINCT e.cod_entrega) AS total_entregas,

                COALESCE(SUM(ie.kg), 0) AS total_kg

             FROM Morador m

             LEFT JOIN entrega e
                ON e.cpf = m.cpf

             LEFT JOIN item_entrega ie
                ON ie.cod_entrega = e.cod_entrega

             WHERE m.cpf = ?

             GROUP BY m.cpf, m.pontos`,
            [cpf]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: 'Morador não encontrado.'
            });
        }

        return res.json({
            cpf: resultado[0].cpf,
            pontos: Number(resultado[0].pontos),
            saldo: Number(resultado[0].pontos),
            total_entregas: Number(resultado[0].total_entregas),
            total_kg: Number(resultado[0].total_kg)
        });

    } catch (erro) {
        console.error('Erro ao carregar resumo:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao carregar resumo do morador.'
        });
    }
});

// ========================================
// RELATÓRIOS ADMINISTRATIVOS
// ========================================

router.get('/relatorios', async (req, res) => {

    try {
        if (!(await exigirAdmin(req, res))) return;

        // ------------------------------------
        // MATERIAIS
        // ------------------------------------

        const [materiais] = await banco.query(
            `SELECT
                m.cod_m,
                m.tipo,
                COALESCE(SUM(ie.kg), 0) AS total_kg,
                COALESCE(SUM(ie.kg * m.ponto_kg), 0) AS total_pontos

             FROM material m

             LEFT JOIN item_entrega ie
                ON ie.cod_m = m.cod_m

             GROUP BY m.cod_m, m.tipo

             ORDER BY m.tipo`
        );

        // ------------------------------------
        // ENTREGAS
        // ------------------------------------

        const [entregas] = await banco.query(
            `SELECT
                COUNT(*) AS total_entregas,
                COALESCE(SUM(total_pontos), 0) AS pontos_gerados
             FROM entrega`
        );

        // ------------------------------------
        // MORADORES
        // ------------------------------------

        const [moradores] = await banco.query(
            `SELECT
                u.nome,
                m.cpf,
                m.pontos,
                COUNT(e.cod_entrega) AS total_entregas

             FROM Morador m

             INNER JOIN Usuario u
                ON u.cpf = m.cpf

             LEFT JOIN entrega e
                ON e.cpf = m.cpf

             GROUP BY u.nome, m.cpf, m.pontos

             ORDER BY total_entregas DESC, m.pontos DESC

             LIMIT 10`
        );

        // ------------------------------------
        // PONTOS DE COLETA
        // ------------------------------------

        const [pontosColeta] = await banco.query(
            'SELECT COUNT(*) AS total FROM ponto_coleta'
        );

        // ------------------------------------
        // RECOMPENSAS
        // ------------------------------------

        const [recompensas] = await banco.query(
            'SELECT COUNT(*) AS total FROM recompensa'
        );

        // ------------------------------------
        // RESGATES
        // ------------------------------------

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

module.exports = router;
