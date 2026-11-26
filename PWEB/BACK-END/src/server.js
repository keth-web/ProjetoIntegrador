
const express = require('express');
const cors = require('cors');

const app = express();
const PORTA = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const usuariosRoutes = require('./usuarios');
const pontosRoutes = require('./pontos');
const materiaisRoutes = require('./materiais');
const recompensasRoutes = require('./recompensas');
const entregasRoutes = require('./entregas');
const relatoriosRoutes = require('./relatorios');
const resgatesRoutes = require('./resgates');


app.use('/', usuariosRoutes);
app.use('/', pontosRoutes);
app.use('/', materiaisRoutes);
app.use('/', recompensasRoutes);
app.use('/', entregasRoutes);
app.use('/', relatoriosRoutes);
app.use('/', resgatesRoutes);


app.get('/', (req, res) => {
    res.send('Servidor CoopRecicla funcionando!');
});



app.use((req, res) => {
    res.status(404).json({
        mensagem: 'Rota não encontrada.'
    });
});


app.listen(PORTA, () => {
    console.log('=================================');
    console.log('COOPRECICLA - SERVIDOR ONLINE');
    console.log(`http://localhost:${PORTA}`);
    console.log('=================================');
});
