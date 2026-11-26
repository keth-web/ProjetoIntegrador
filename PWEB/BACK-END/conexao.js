
require('dotenv').config();

const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'CoopRecicla',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((erro, conexao) => {
    if (erro) {
        console.error('Erro na conexão com o banco:', erro.message);
        return;
    }

    console.log('Banco de dados conectado com sucesso!');
    conexao.release();
});

module.exports = db;
