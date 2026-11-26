const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

const controller = new UsuarioController();

router.post('/cadastro', (req, res) => {
    controller.cadastrar(req, res);
});

router.post('/login', (req, res) => {
    controller.login(req, res);
});

module.exports = router;