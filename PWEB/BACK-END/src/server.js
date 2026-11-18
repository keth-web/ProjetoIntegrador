
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API CoopRecicla funcionando!');
});
app.get('/sobre', (req, res) => {
    res.json({
        projeto: 'CoopRecicla',
        versao: '1.0',
        status: 'Em desenvolvimento'
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
app.post('/usuarios', (req, res) => {
    const dados = req.body;

    res.status(201).json({
        mensagem: 'Usuário recebido com sucesso!',
        usuario: dados
    });
});