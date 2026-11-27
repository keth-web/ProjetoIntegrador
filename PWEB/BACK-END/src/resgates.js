
const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const { banco } = require('./funcoes');

// ========================================
// REALIZAR RESGATE
// ========================================

router.post('/resgates', async (req, res) => {

    let conexao;
    let transacaoIniciada = false;

    try {
        const { cpf, cod_recomp } = req.body;

        if (!cpf || !cod_recomp) {
            return res.status(400).json({
                mensagem: 'Informe o CPF e a recompensa.'
            });
        }

        if (String(cpf).length !== 11) {
            return res.status(400).json({
                mensagem: 'CPF inválido.'
            });
        }

        // Pegar conexão individual do pool
        conexao = await banco.getConnection();

        await conexao.beginTransaction();
        transacaoIniciada = true;

        // Buscar morador
        const [moradores] = await conexao.query(
            `SELECT cpf, pontos
             FROM Morador
             WHERE cpf = ?
             FOR UPDATE`,
            [cpf]
        );

        if (moradores.length === 0) {
            throw new Error('Morador não encontrado.');
        }

        // Buscar recompensa
        const [recompensas] = await conexao.query(
            `SELECT cod_recomp, catalogo, registro_pontos
             FROM recompensa
             WHERE cod_recomp = ?`,
            [cod_recomp]
        );

        if (recompensas.length === 0) {
            throw new Error('Recompensa não encontrada.');
        }

        const saldo = Number(moradores[0].pontos);
        const recompensa = recompensas[0];
        const custo = Number(recompensa.registro_pontos);

        if (!Number.isFinite(custo) || custo <= 0) {
            throw new Error('Pontuação da recompensa inválida.');
        }

        if (saldo < custo) {
            throw new Error(
                'Você não possui pontos suficientes para esse resgate.'
            );
        }

        // Gerar código
        const cod_resg =
            'R' + crypto.randomBytes(4).toString('hex').toUpperCase();

        // Descontar pontos
        await conexao.query(
            `UPDATE Morador
             SET pontos = pontos - ?
             WHERE cpf = ?`,
            [custo, cpf]
        );

        // Registrar resgate
        await conexao.query(
            `INSERT INTO resgate
             (cod_recomp, cpf, cod_resg, data_resg)
             VALUES (?, ?, ?, CURDATE())`,
            [cod_recomp, cpf, cod_resg]
        );

        // Confirmar
        await conexao.commit();
        transacaoIniciada = false;

        return res.status(201).json({
            mensagem: 'Resgate realizado com sucesso!',
            cod_resg,
            catalogo: recompensa.catalogo,
            pontos_descontados: custo,
            saldo_atual: saldo - custo
        });

    } catch (erro) {

        if (conexao && transacaoIniciada) {
            try {
                await conexao.rollback();
            } catch (erroRollback) {
                console.error('Erro no rollback:', erroRollback);
            }
        }

        console.error('Erro ao registrar resgate:', erro);

        return res.status(500).json({
            mensagem: erro.message ||
                'Não foi possível realizar o resgate.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});

// ========================================
// HISTÓRICO DE RESGATES
// ========================================

router.get('/moradores/:cpf/resgates', async (req, res) => {

    try {
        const { cpf } = req.params;

        const [resultado] = await banco.query(
            `SELECT
                r.cod_resg AS cod_resgate,
                r.cod_recomp,
                r.cpf,
                r.data_resg AS data_resgate,
                rec.catalogo,
                rec.registro_pontos

             FROM resgate r

             INNER JOIN recompensa rec
                ON r.cod_recomp = rec.cod_recomp

             WHERE r.cpf = ?

             ORDER BY r.data_resg DESC`,
            [cpf]
        );

        return res.json(resultado);

    } catch (erro) {
        console.error('Erro ao listar resgates:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao consultar histórico de resgates.'
        });
    }
});

module.exports = router;
