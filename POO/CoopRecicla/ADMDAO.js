const db = require('../../PWEB/BACK-END/conexao');
class ADMDAO {
    cadastrar(adm, callback) {
        try { adm.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            INSERT INTO ADM (cpf, status_adm, senha)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [
            adm.getCpf(),
            adm.getStatus_adm(),
            adm.getSenha()
        ], callback);
    }

    listar(callback) {
        db.query('SELECT * FROM ADM', callback);
    }

    buscarPorCpf(cpf, callback) {
        db.query('SELECT * FROM ADM WHERE cpf = ?', [cpf], callback);
    }

    atualizar(adm, callback) {
        try { adm.validar(); } catch (erro) { return callback(erro); }

        const sql = `
            UPDATE ADM
            SET status_adm = ?, senha = ?
            WHERE cpf = ?
        `;

        db.query(sql, [
            adm.getStatus_adm(),
            adm.getSenha(),
            adm.getCpf()
        ], callback);
    }

    excluir(cpf, callback) {
        db.query('DELETE FROM ADM WHERE cpf = ?', [cpf], callback);
    }
}

module.exports = ADMDAO;
