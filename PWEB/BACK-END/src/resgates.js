
const express = require('express');
const router = express.Router();

const db = require('../conexao');

const {
    recompensaDAO,
    resgateDAO
} = require('./funcoes');

// ========================================
// REGISTRAR RESGATE
// ========================================

router.post('/resgates', async (req, res) => {
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

    db.beginTransaction(async (erro) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                mensagem: 'Erro ao iniciar o resgate.'
            });
        }

        const consultar = (sql, parametros) => {
            return new Promise((resolve, reject) => {
                db.query(sql, parametros, (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                });
            });
        };

        const finalizarErro = (status, mensagem) => {
            return db.rollback(() => {
                res.status(status).json({ mensagem });
            });
        };

        try {
            // Busca o morador e bloqueia seu registro
            // durante a operação para evitar descontos simultâneos.
            const moradores = await consultar(
                `SELECT cpf, pontos
                 FROM Morador
                 WHERE cpf = ?
                 FOR UPDATE`,
                [cpf]
            );

            if (moradores.length === 0) {
                return finalizarErro(
                    404,
                    'Morador não encontrado.'
                );
            }

            // Busca a recompensa
            const recompensas = await consultar(
                `SELECT cod_recomp, catalogo, registro_pontos
                 FROM recompensa
                 WHERE cod_recomp = ?`,
                [cod_recomp]
            );

            if (recompensas.length === 0) {
                return finalizarErro(
                    404,
                    'Recompensa não encontrada.'
                );
            }

            const morador = moradores[0];
            const recompensa = recompensas[0];

            const saldo = Number(morador.pontos);
            const custo = Number(recompensa.registro_pontos);

            if (!Number.isFinite(custo) || custo <= 0) {
                return finalizarErro(
                    400,
                    'Pontuação da recompensa inválida.'
                );
            }

            if (saldo < custo) {
                return finalizarErro(
                    400,
                    'Você não possui pontos suficientes para esse resgate.'
                );
            }

            // Gera o código do resgate
            const cod_resg =
                `R${Date.now().toString().slice(-8)}`;

            // Data atual
            const data_resg = new Date()
                .toISOString()
                .slice(0, 10);

            // Desconta os pontos do morador
            await consultar(
                `UPDATE Morador
                 SET pontos = pontos - ?
                 WHERE cpf = ?`,
                [custo, cpf]
            );

            // Registra o resgate
            await consultar(
                `INSERT INTO resgate
                 (cod_recomp, cpf, cod_resg, data_resg)
                 VALUES (?, ?, ?, ?)`,
                [cod_recomp, cpf, cod_resg, data_resg]
            );

            // Confirma as duas operações
            db.commit((erroCommit) => {
                if (erroCommit) {
                    return db.rollback(() => {
                        console.error(erroCommit);

                        res.status(500).json({
                            mensagem: 'Erro ao confirmar o resgate.'
                        });
                    });
                }

                return res.status(201).json({
                    mensagem: 'Resgate realizado com sucesso!',
                    cod_resg,
                    catalogo: recompensa.catalogo,
                    pontos_descontados: custo,
                    saldo_atual: saldo - custo
                });
            });

        } catch (erro) {
            console.error('Erro ao registrar resgate:', erro);

            finalizarErro(
                500,
                'Não foi possível realizar o resgate.'
            );
        }
    });
});


// ========================================
// LISTAR RESGATES DO MORADOR
// ========================================

router.get('/moradores/:cpf/resgates', async (req, res) => {
    const { cpf } = req.params;

    try {
        const [resultado] = await db.promise().query(
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

        return res.status(200).json(resultado);

    } catch (erro) {
        console.error('Erro ao listar resgates:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao consultar histórico de resgates.'
        });
    }
});

module.exports = router;
