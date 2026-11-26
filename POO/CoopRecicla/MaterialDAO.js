
const db = require('../../PWEB/BACK-END/conexao');

class MaterialDAO {

    // =============================================
    // CADASTRAR
    // =============================================

    cadastrar(material, callback) {
        try {
            material.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            INSERT INTO material
                (cod_m, tipo, ponto_kg)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [
            material.getCod_m(),
            material.getTipo(),
            material.getPonto_kg()
        ], callback);
    }

    // =============================================
    // LISTAR
    // =============================================

    listar(callback) {
        const sql = `
            SELECT
                cod_m,
                tipo,
                ponto_kg
            FROM material
            ORDER BY cod_m ASC
        `;

        db.query(sql, callback);
    }

    // =============================================
    // BUSCAR POR CÓDIGO
    // =============================================

    buscarPorCodigo(cod_m, callback) {
        const sql = `
            SELECT
                cod_m,
                tipo,
                ponto_kg
            FROM material
            WHERE cod_m = ?
        `;

        db.query(sql, [cod_m], callback);
    }

    // =============================================
    // ATUALIZAR
    // =============================================

    atualizar(material, callback) {
        try {
            material.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            UPDATE material
            SET
                tipo = ?,
                ponto_kg = ?
            WHERE cod_m = ?
        `;

        db.query(sql, [
            material.getTipo(),
            material.getPonto_kg(),
            material.getCod_m()
        ], callback);
    }

    // =============================================
    // EXCLUIR
    // =============================================

    excluir(cod_m, callback) {
        const sql = `
            DELETE FROM material
            WHERE cod_m = ?
        `;

        db.query(sql, [cod_m], callback);
    }
}

module.exports = MaterialDAO;
