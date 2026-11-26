
const express = require('express');
const cors = require('cors');

const app = express();
const PORTA = 3000;

// =====================================
// CONFIGURAÇÕES
// =====================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// IMPORTAÇÃO DAS ROTAS
// =====================================

const usuariosRoutes = require('./usuarios');
const pontosRoutes = require('./pontos');
const materiaisRoutes = require('./materiais');
const recompensasRoutes = require('./recompensas');
const entregasRoutes = require('./entregas');
const relatoriosRoutes = require('./relatorios');

// =====================================
// REGISTRO DAS ROTAS
// =====================================

app.use('/', usuarios);
app.use('/', pontos);
app.use('/', materiais);
app.use('/', recompensas);
app.use('/', entregas);
app.use('/', relatorios);

// =====================================
// ROTA INICIAL
// =====================================

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API CoopRecicla funcionando!'
    });
});

// =====================================
// INICIAR SERVIDOR
// =====================================

app.listen(PORTA, () => {
    console.log(`Servidor CoopRecicla rodando em http://localhost:${PORTA}`);
});
