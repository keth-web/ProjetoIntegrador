
const Material = require('../Material');
const MaterialDAO = require('../MaterialDAO');

const dao = new MaterialDAO();

const material = new Material('MAT000006', 'PIL', 12);


dao.cadastrar(material, (erro, resultado) => {
    if (erro) {
        console.log('Erro ao cadastrar:', erro);
        return;
    }

    console.log('CREATE - Material cadastrado!');


    dao.buscarPorCodigo('MAT000006', (erro, resultado) => {
        if (erro) {
            console.log('Erro ao buscar:', erro);
            return;
        }

        console.log('READ - Material encontrado:', resultado);


        const atualizado = new Material('MAT000006', 'PIL', 20);

        dao.atualizar(atualizado, (erro, resultado) => {
            if (erro) {
                console.log('Erro ao atualizar:', erro);
                return;
            }

            console.log('UPDATE - Material atualizado!');


            dao.excluir('MAT000006', (erro, resultado) => {
                if (erro) {
                    console.log('Erro ao excluir:', erro);
                    return;
                }

                console.log('DELETE - Material excluÃ­do!');
            });
        });
    });
});
