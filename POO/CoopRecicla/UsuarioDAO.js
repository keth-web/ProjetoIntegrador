const db = require('./conexao');

class UsuarioDAO {

    cadastrar(usuario, callback) {
        const sql = `
            INSERT INTO Usuario (cpf, tel, nome, email)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [
            usuario.getCpf(),
            usuario.getTel(),
            usuario.getNome(),
            usuario.getEmail()
        ], callback);
    }

    listar(callback) {
        const sql = `
            SELECT cpf, tel, nome, email
            FROM Usuario
        `;

        db.query(sql, callback);
    }

    buscarPorCpf(cpf, callback) {
        const sql = `
            SELECT cpf, tel, nome, email
            FROM Usuario
            WHERE cpf = ?
        `;

        db.query(sql, [cpf], callback);
    }

    atualizar(usuario, callback) {
        const sql = `
            UPDATE Usuario
            SET tel = ?, nome = ?, email = ?
            WHERE cpf = ?
        `;

        db.query(sql, [
            usuario.getTel(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getCpf()
        ], callback);
    }

    excluir(cpf, callback) {
        const sql = `
            DELETE FROM Usuario
            WHERE cpf = ?
        `;

        db.query(sql, [cpf], callback);
    }
}

module.exports = UsuarioDAO;
