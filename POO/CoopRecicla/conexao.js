require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  process.env.DB_PASSWORD,
    database: 'CoopRecicla'
});

db.connect((erro) => {
    if (erro) {
        console.log('Erro na conexão:', erro);
    } else {
        console.log('Banco de dados conectado!');
    }
});

module.exports = db;
