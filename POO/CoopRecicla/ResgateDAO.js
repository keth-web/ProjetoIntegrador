const db = require('../../PWEB/BACK-END/conexao');

class ResgateDAO {
    cadastrar(resgate, callback) {
        try { resgate.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            INSERT INTO resgate (cod_recomp, cpf, cod_resg, data_resg)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [
            resgate.getCod_recomp(),
            resgate.getCpf(),
            resgate.getCod_resg(),
            resgate.getData_resg()
        ], callback);
    }

    listar(callback) {
        db.query('SELECT * FROM resgate', callback);
    }

    buscarPorCodigo(cod_resg, callback) {
        db.query('SELECT * FROM resgate WHERE cod_resg = ?', [cod_resg], callback);
    }

    listarPorMorador(cpf, callback) {
        db.query('SELECT * FROM resgate WHERE cpf = ?', [cpf], callback);
    }

    atualizar(resgate, callback) {
        try { resgate.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            UPDATE resgate
            SET cod_recomp = ?, cpf = ?, data_resg = ?
            WHERE cod_resg = ?
        `;

        db.query(sql, [
            resgate.getCod_recomp(),
            resgate.getCpf(),
            resgate.getData_resg(),
            resgate.getCod_resg()
        ], callback);
    }

    excluir(cod_resg, callback) {
        db.query('DELETE FROM resgate WHERE cod_resg = ?', [cod_resg], callback);
    }
}

module.exports = ResgateDAO;
