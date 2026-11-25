const db = require('../../PWEB/BACK-END/conexao');

class EntregaDAO {

    cadastrar(entrega, callback) {
        try {
            entrega.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            INSERT INTO entrega
            (id, cpf, cod_entrega, hora, total_pontos, data_a)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            entrega.getId(),
            entrega.getCpf(),
            entrega.getCod_entrega(),
            entrega.getHora(),
            entrega.getTotal_pontos(),
            entrega.getData_a()
        ], callback);
    }

    listar(callback) {
        const sql = 'SELECT * FROM entrega';

        db.query(sql, callback);
    }

    buscarPorCodigo(cod_entrega, callback) {
        const sql = `
            SELECT * FROM entrega
            WHERE cod_entrega = ?
        `;

        db.query(sql, [cod_entrega], callback);
    }

    atualizar(entrega, callback) {
        try {
            entrega.validar();
        } catch (erro) {
            return callback(erro);
        }

        const sql = `
            UPDATE entrega
            SET id = ?, cpf = ?, hora = ?,
                total_pontos = ?, data_a = ?
            WHERE cod_entrega = ?
        `;

        db.query(sql, [
            entrega.getId(),
            entrega.getCpf(),
            entrega.getHora(),
            entrega.getTotal_pontos(),
            entrega.getData_a(),
            entrega.getCod_entrega()
        ], callback);
    }

    excluir(cod_entrega, callback) {
        const sql = `
            DELETE FROM entrega
            WHERE cod_entrega = ?
        `;

        db.query(sql, [cod_entrega], callback);
    }
}

module.exports = EntregaDAO;
