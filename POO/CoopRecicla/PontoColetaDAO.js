const db = require('../../PWEB/BACK-END/conexao');
class PontoColetaDAO {
    cadastrar(ponto, callback) {
        try { ponto.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            INSERT INTO ponto_coleta (nome, end, tel)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [
            ponto.getNome(),
            ponto.getEnd(),
            ponto.getTel()
        ], callback);
    }

    listar(callback) {
        db.query('SELECT * FROM ponto_coleta', callback);
    }

    buscarPorId(id, callback) {
        db.query('SELECT * FROM ponto_coleta WHERE id = ?', [id], callback);
    }

    atualizar(ponto, callback) {
        try { ponto.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            UPDATE ponto_coleta
            SET nome = ?, \`end\` = ?, tel = ?
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
        db.query('DELETE FROM ponto_coleta WHERE id = ?', [id], callback);
    }
}

module.exports = PontoColetaDAO;
