const db = require('../../PWEB/BACK-END/conexao');

class RecompensaDAO {
    cadastrar(recompensa, callback) {
        try { recompensa.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            INSERT INTO recompensa (cod_recomp, registro_pontos, catalogo)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [
            recompensa.getCod_recomp(),
            recompensa.getRegistro_pontos(),
            recompensa.getCatalogo()
        ], callback);
    }

    listar(callback) {
        db.query('SELECT * FROM recompensa', callback);
    }

    buscarPorCodigo(cod_recomp, callback) {
        db.query('SELECT * FROM recompensa WHERE cod_recomp = ?', [cod_recomp], callback);
    }

    atualizar(recompensa, callback) {
        try { recompensa.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            UPDATE recompensa
            SET registro_pontos = ?, catalogo = ?
            WHERE cod_recomp = ?
        `;

        db.query(sql, [
            recompensa.getRegistro_pontos(),
            recompensa.getCatalogo(),
            recompensa.getCod_recomp()
        ], callback);
    }

    excluir(cod_recomp, callback) {
        db.query('DELETE FROM recompensa WHERE cod_recomp = ?', [cod_recomp], callback);
    }
}

module.exports = RecompensaDAO;
