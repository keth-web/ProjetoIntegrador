const db = require('../../conexao');
class MoradorDAO {

    cadastrar(morador, callback) {
        db.beginTransaction((erro) => {
            if (erro) return callback(erro);

            const sqlUsuario = `
                INSERT INTO Usuario (cpf, tel, nome, email)
                VALUES (?, ?, ?, ?)
            `;

            db.query(sqlUsuario, [
                morador.getCpf(),
                morador.getTel(),
                morador.getNome(),
                morador.getEmail()
            ], (erro) => {

                if (erro) {
                    return db.rollback(() => callback(erro));
                }

                const sqlMorador = `
                    INSERT INTO Morador (cpf, endereco, pontos)
                    VALUES (?, ?, ?)
                `;

                db.query(sqlMorador, [
                    morador.getCpf(),
                    morador.getEndereco(),
                    morador.getPontos()
                ], (erro, resultado) => {

                    if (erro) {
                        return db.rollback(() => callback(erro));
                    }

                    db.commit((erro) => {
                        if (erro) {
                            return db.rollback(() => callback(erro));
                        }

                        callback(null, resultado);
                    });
                });
            });
        });
    }

    listar(callback) {
        const sql = `
            SELECT
                Usuario.cpf,
                Usuario.tel,
                Usuario.nome,
                Usuario.email,
                Morador.endereco,
                Morador.pontos
            FROM Usuario
            INNER JOIN Morador
                ON Usuario.cpf = Morador.cpf
        `;

        db.query(sql, callback);
    }

    buscarPorCpf(cpf, callback) {
        const sql = `
            SELECT
                Usuario.cpf,
                Usuario.tel,
                Usuario.nome,
                Usuario.email,
                Morador.endereco,
                Morador.pontos
            FROM Usuario
            INNER JOIN Morador
                ON Usuario.cpf = Morador.cpf
            WHERE Morador.cpf = ?
        `;

        db.query(sql, [cpf], callback);
    }

    atualizar(morador, callback) {
        db.beginTransaction((erro) => {
            if (erro) return callback(erro);

            const sqlUsuario = `
                UPDATE Usuario
                SET tel = ?, nome = ?, email = ?
                WHERE cpf = ?
            `;

            db.query(sqlUsuario, [
                morador.getTel(),
                morador.getNome(),
                morador.getEmail(),
                morador.getCpf()
            ], (erro) => {

                if (erro) {
                    return db.rollback(() => callback(erro));
                }

                const sqlMorador = `
                    UPDATE Morador
                    SET endereco = ?, pontos = ?
                    WHERE cpf = ?
                `;

                db.query(sqlMorador, [
                    morador.getEndereco(),
                    morador.getPontos(),
                    morador.getCpf()
                ], (erro, resultado) => {

                    if (erro) {
                        return db.rollback(() => callback(erro));
                    }

                    db.commit((erro) => {
                        if (erro) {
                            return db.rollback(() => callback(erro));
                        }

                        callback(null, resultado);
                    });
                });
            });
        });
    }

    excluir(cpf, callback) {
        db.beginTransaction((erro) => {
            if (erro) return callback(erro);

            const sqlMorador = `
                DELETE FROM Morador
                WHERE cpf = ?
            `;

            db.query(sqlMorador, [cpf], (erro) => {

                if (erro) {
                    return db.rollback(() => callback(erro));
                }

                const sqlUsuario = `
                    DELETE FROM Usuario
                    WHERE cpf = ?
                `;

                db.query(sqlUsuario, [cpf], (erro, resultado) => {

                    if (erro) {
                        return db.rollback(() => callback(erro));
                    }

                    db.commit((erro) => {
                        if (erro) {
                            return db.rollback(() => callback(erro));
                        }

                        callback(null, resultado);
                    });
                });
            });
        });
    }
}

module.exports = MoradorDAO;
