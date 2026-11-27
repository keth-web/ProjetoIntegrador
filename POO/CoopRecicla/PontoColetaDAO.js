
const db = require('../../PWEB/BACK-END/conexao');

class PontoColetaDAO {

    cadastrar(ponto, callback) {
        try {
            ponto.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            INSERT INTO ponto_coleta (nome, ende, tel)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [
            ponto.getNome(),
            ponto.getEnd(),
            ponto.getTel()
        ], callback);
    }

    listar(callback) {
        const sql = `
            SELECT
                id,
                nome,
                ende AS \`end\`,
                tel
            FROM ponto_coleta
            ORDER BY id ASC
        `;

        db.query(sql, callback);
    }

    buscarPorId(id, callback) {
        const sql = `
            SELECT
                id,
                nome,
                ende AS \`end\`,
                tel
            FROM ponto_coleta
            WHERE id = ?
        `;

        db.query(sql, [id], callback);
    }

    atualizar(ponto, callback) {
        try {
            ponto.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            UPDATE ponto_coleta
            SET nome = ?, ende = ?, tel = ?
            WHERE id = ?
        `;

        db.query(sql, [
            ponto.getNome(),
            ponto.getEnd(),
            ponto.getTel(),
            ponto.getId()
        ], callback);
    }

    excluir(id, callback) {
        const sql = `
            DELETE FROM ponto_coleta
            WHERE id = ?
        `;

        db.query(sql, [id], callback);
    }
}

module.exports = PontoColetaDAO;
