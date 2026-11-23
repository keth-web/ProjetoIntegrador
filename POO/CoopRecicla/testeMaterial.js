
const MaterialDAO = require('./MaterialDAO');

const dao = new MaterialDAO();

dao.excluir('MAT000006', (erro, resultado) => {
    if (erro) {
        console.log('Erro ao excluir:', erro);
    } else {
        console.log('Material excluído!');
        console.log(resultado);

        dao.buscarPorCodigo('MAT000006', (erro, materiais) => {
            if (erro) {
                console.log('Erro na busca:', erro);
            } else {
                console.log('Resultado da busca após exclusão:');
                console.log(materiais);
            }
        });
    }
});