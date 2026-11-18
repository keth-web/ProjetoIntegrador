const http = require('http');

const servidor = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end('<h1>Meu servidor está funcionando!</h1>');
});

servidor.listen(3000, () => {
    console.log('Servidor iniciado!');
    console.log('http://localhost:3000');
});