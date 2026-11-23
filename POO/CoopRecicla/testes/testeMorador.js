
const Morador = require('../Morador');
const MoradorDAO = require('../MoradorDAO');

const dao = new MoradorDAO();

const morador = new Morador(
    '98765432100',
    '82988887777',
    'Carlos',
    'carlos@email.com',
    'Rua das Flores, 20',
    0
);
r
dao.cadastrar(morador, (erro, resultado) => {
    if (erro) {
        console.log('Erro ao cadastrar:', erro);
        return;
    }

    console.log('CREATE - Morador cadastrado!');


    dao.buscarPorCpf('98765432100', (erro, resultado) => {
        if (erro) {
            console.log('Erro ao buscar:', erro);
            return;
        }

        console.log('READ - Morador encontrado:', resultado);

        const atualizado = new Morador(
            '98765432100',
            '82988887777',
            'Carlos Silva',
            'carlos.silva@email.com',
            'Rua Nova, 50',
            100
        );

        dao.atualizar(atualizado, (erro, resultado) => {
            if (erro) {
                console.log('Erro ao atualizar:', erro);
                return;
            }

            console.log('UPDATE - Morador atualizado!');


            dao.excluir('98765432100', (erro, resultado) => {
                if (erro) {
                    console.log('Erro ao excluir:', erro);
                    return;
                }

                console.log('DELETE - Morador excluÃ­do!');
            });
        });
    });
});
