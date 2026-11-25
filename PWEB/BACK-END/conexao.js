
require('dotenv').config();

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'CoopRecicla'
});

db.connect((erro) => {
    if (erro) {
        console.log('Erro na conexão com o banco:', erro.message);
    } else {
        console.log('Banco de dados conectado com sucesso!');
    }
});

module.exports = db;
