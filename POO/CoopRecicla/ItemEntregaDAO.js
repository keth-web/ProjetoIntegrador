const db = require('../../PWEB/BACK-END/conexao');
class ItemEntregaDAO {
    cadastrar(item, callback) {
        try { item.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            INSERT INTO item_entrega (cod_m, cod_entrega, codigoE, kg)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [
            item.getCod_m(),
            item.getCod_entrega(),
            item.getCodigoE(),
            item.getKg()
        ], callback);
    }

    listar(callback) {
        db.query('SELECT * FROM item_entrega', callback);
    }

    buscarPorCodigo(codigoE, callback) {
        db.query('SELECT * FROM item_entrega WHERE codigoE = ?', [codigoE], callback);
    }

    listarPorEntrega(cod_entrega, callback) {
        db.query('SELECT * FROM item_entrega WHERE cod_entrega = ?', [cod_entrega], callback);
    }

    atualizar(item, callback) {
        try { item.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            UPDATE item_entrega
            SET cod_m = ?, cod_entrega = ?, kg = ?
            WHERE codigoE = ?
        `;

        db.query(sql, [
            item.getCod_m(),
            item.getCod_entrega(),
            item.getKg(),
            item.getCodigoE()
        ], callback);
    }

    excluir(codigoE, callback) {
        db.query('DELETE FROM item_entrega WHERE codigoE = ?', [codigoE], callback);
    }
}

module.exports = ItemEntregaDAO;
