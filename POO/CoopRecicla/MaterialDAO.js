
const db = require('./conexao');

class MaterialDAO {

    cadastrar(material, callback) {
        try {
            material.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            INSERT INTO material (cod_m, tipo, ponto_kg)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [
            material.getCod_m(),
            material.getTipo(),
            material.getPonto_kg()
        ], callback);
    }

    listar(callback) {
        const sql = 'SELECT * FROM material';

        db.query(sql, callback);
    }

    buscarPorCodigo(cod_m, callback) {
        const sql = `
            SELECT * FROM material
            WHERE cod_m = ?
        `;

        db.query(sql, [cod_m], callback);
    }

    atualizar(material, callback) {
        try {
            material.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            UPDATE material
            SET tipo = ?, ponto_kg = ?
            WHERE cod_m = ?
        `;

        db.query(sql, [
            material.getTipo(),
            material.getPonto_kg(),
            material.getCod_m()
        ], callback);
    }

    excluir(cod_m, callback) {
        const sql = `
            DELETE FROM material
            WHERE cod_m = ?
        `;

        db.query(sql, [cod_m], callback);
    }
}

module.exports = MaterialDAO;