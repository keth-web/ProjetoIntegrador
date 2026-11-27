
const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const {
    banco,
    Entrega,
    ItemEntrega,
    itemEntregaDAO,
    resgateDAO,
    executarDAO,
    exigirAdmin
} = require('./funcoes');

// ========================================
// GERAR CÓDIGOS
// ========================================

function gerarCodigo(prefixo) {
    return prefixo + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// ========================================
// LISTAR ITENS DE ENTREGA - ADMIN
// ========================================

router.get('/itens-entrega', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const itens = await executarDAO(
            itemEntregaDAO,
            'listar'
        );

        return res.json(itens);

    } catch (erro) {
        console.error('Erro ao listar itens:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar itens de entrega.'
        });
    }
});

// ========================================
// LISTAR RESGATES - ADMIN
// ========================================

router.get('/resgates', async (req, res) => {
    try {
        if (!(await exigirAdmin(req, res))) return;

        const resgates = await executarDAO(
            resgateDAO,
            'listar'
        );

        return res.json(resgates);

    } catch (erro) {
        console.error('Erro ao listar resgates:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar resgates.'
        });
    }
});

// ========================================
// CADASTRAR ENTREGA
// ========================================

router.post('/entregas', async (req, res) => {

    let conexao;
    let transacaoIniciada = false;

    try {

        const { cpf, id, data, itens } = req.body;

        // ------------------------------------
        // VALIDAR DADOS RECEBIDOS
        // ------------------------------------

        if (!cpf || String(cpf).length !== 11) {
            return res.status(400).json({
                mensagem: 'CPF inválido.'
            });
        }

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensagem: 'Selecione um ponto de coleta válido.'
            });
        }

        if (!data) {
            return res.status(400).json({
                mensagem: 'Informe a data da entrega.'
            });
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({
                mensagem: 'Adicione pelo menos um material.'
            });
        }

        for (const item of itens) {
            if (
                !item.cod_m ||
                !Number.isFinite(Number(item.kg)) ||
                Number(item.kg) <= 0
            ) {
                return res.status(400).json({
                    mensagem: 'Um dos materiais possui dados inválidos.'
                });
            }
        }

        // ------------------------------------
        // PEGAR CONEXÃO INDIVIDUAL DO POOL
        // ------------------------------------

        conexao = await banco.getConnection();

        await conexao.beginTransaction();
        transacaoIniciada = true;

        // ------------------------------------
        // VERIFICAR MORADOR
        // ------------------------------------

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

        // ------------------------------------
        // VERIFICAR PONTO DE COLETA
        // ------------------------------------

        const [pontos] = await conexao.query(
            `SELECT id
             FROM ponto_coleta
             WHERE id = ?`,
            [Number(id)]
        );

        if (pontos.length === 0) {
            throw new Error('Ponto de coleta não encontrado.');
        }

        // ------------------------------------
        // VALIDAR MATERIAIS E CALCULAR PONTOS
        // ------------------------------------

        let totalPontos = 0;
        const materiaisValidados = [];

        for (const item of itens) {

            const [materiais] = await conexao.query(
                `SELECT cod_m, tipo, ponto_kg
                 FROM material
                 WHERE cod_m = ?`,
                [item.cod_m]
            );

            if (materiais.length === 0) {
                throw new Error(
                    `Material ${item.cod_m} não encontrado.`
                );
            }

            const material = materiais[0];
            const kg = Number(item.kg);
            const pontosMaterial = kg * Number(material.ponto_kg);

            totalPontos += pontosMaterial;

            materiaisValidados.push({
                cod_m: material.cod_m,
                kg: kg
            });
        }

        totalPontos = Math.round(totalPontos);

        // ------------------------------------
        // GERAR DATA E HORA
        // ------------------------------------

        const agora = new Date();

        const hora = [
            String(agora.getHours()).padStart(2, '0'),
            String(agora.getMinutes()).padStart(2, '0'),
            String(agora.getSeconds()).padStart(2, '0')
        ].join(':');

        // ------------------------------------
        // CADASTRAR ENTREGA
        // ------------------------------------

        const codEntrega = gerarCodigo('E');

        const entrega = new Entrega(
            Number(id),
            String(cpf),
            codEntrega,
            hora,
            totalPontos,
            data
        );

        entrega.validar();

        await conexao.query(
            `INSERT INTO entrega
             (id, cpf, cod_entrega, hora, total_pontos, data_a)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                entrega.getId(),
                entrega.getCpf(),
                codEntrega,
                entrega.getHora(),
                entrega.getTotal_pontos(),
                entrega.getData_a()
            ]
        );

        // ------------------------------------
        // CADASTRAR ITENS DA ENTREGA
        // ------------------------------------

        for (const item of materiaisValidados) {

            const codigoItem = gerarCodigo('I');

            const itemEntrega = new ItemEntrega(
                item.cod_m,
                codEntrega,
                codigoItem,
                item.kg
            );

            itemEntrega.validar();

            await conexao.query(
                `INSERT INTO item_entrega
                 (cod_m, cod_entrega, codigoE, kg)
                 VALUES (?, ?, ?, ?)`,
                [
                    itemEntrega.getCod_m(),
                    itemEntrega.getCod_entrega(),
                    itemEntrega.getCodigoE(),
                    itemEntrega.getKg()
                ]
            );
        }

        // ------------------------------------
        // ATUALIZAR PONTOS DO MORADOR
        // ------------------------------------

        await conexao.query(
            `UPDATE Morador
             SET pontos = pontos + ?
             WHERE cpf = ?`,
            [totalPontos, cpf]
        );

        // ------------------------------------
        // CONFIRMAR TRANSAÇÃO
        // ------------------------------------

        await conexao.commit();
        transacaoIniciada = false;

        return res.status(201).json({
            mensagem: 'Entrega registrada com sucesso!',
            cod_entrega: codEntrega,
            total_pontos: totalPontos
        });

    } catch (erro) {

        if (conexao && transacaoIniciada) {
            try {
                await conexao.rollback();
            } catch (erroRollback) {
                console.error('Erro no rollback:', erroRollback);
            }
        }

        console.error('Erro ao registrar entrega:', erro);

        return res.status(500).json({
            mensagem: erro.message || 'Erro ao registrar entrega.'
        });

    } finally {

        if (conexao) {
            conexao.release();
        }
    }
});

// ========================================
// HISTÓRICO DE ENTREGAS DO MORADOR
// ========================================

router.get('/moradores/:cpf/entregas', async (req, res) => {
    try {

        const { cpf } = req.params;

        const [entregas] = await banco.query(
            `SELECT
                e.cod_entrega,
                e.data_a AS data_entrega,
                e.hora,
                e.total_pontos AS pontos,
                p.nome AS nome_ponto,
                GROUP_CONCAT(
                    CONCAT(m.tipo, ' (', ie.kg, ' kg)')
                    SEPARATOR ', '
                ) AS itens

             FROM entrega e

             INNER JOIN ponto_coleta p
                ON p.id = e.id

             LEFT JOIN item_entrega ie
                ON ie.cod_entrega = e.cod_entrega

             LEFT JOIN material m
                ON m.cod_m = ie.cod_m

             WHERE e.cpf = ?

             GROUP BY
                e.cod_entrega,
                e.data_a,
                e.hora,
                e.total_pontos,
                p.nome

             ORDER BY
                e.data_a DESC,
                e.hora DESC`,
            [cpf]
        );

        return res.json(entregas);

    } catch (erro) {

        console.error('Erro ao carregar histórico:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao carregar histórico de entregas.'
        });
    }
});

module.exports = router;
