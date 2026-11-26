

const db = require('../conexao');
const banco = db.promise();


const Usuario = require('../../../POO/CoopRecicla/Usuario');
const UsuarioDAO = require('../../../POO/CoopRecicla/UsuarioDAO');

const Morador = require('../../../POO/CoopRecicla/Morador');
const MoradorDAO = require('../../../POO/CoopRecicla/MoradorDAO');

const ADM = require('../../../POO/CoopRecicla/ADM');
const ADMDAO = require('../../../POO/CoopRecicla/ADMDAO');

const PontoColeta = require('../../../POO/CoopRecicla/PontoColeta');
const PontoColetaDAO = require('../../../POO/CoopRecicla/PontoColetaDAO');

const Material = require('../../../POO/CoopRecicla/Material');
const MaterialDAO = require('../../../POO/CoopRecicla/MaterialDAO');

const Recompensa = require('../../../POO/CoopRecicla/Recompensa');
const RecompensaDAO = require('../../../POO/CoopRecicla/RecompensaDAO');

const Entrega = require('../../../POO/CoopRecicla/Entrega');
const EntregaDAO = require('../../../POO/CoopRecicla/EntregaDAO');

const ItemEntrega = require('../../../POO/CoopRecicla/ItemEntrega');
const ItemEntregaDAO = require('../../../POO/CoopRecicla/ItemEntregaDAO');

const Resgate = require('../../../POO/CoopRecicla/Resgate');
const ResgateDAO = require('../../../POO/CoopRecicla/ResgateDAO');


const usuarioDAO = new UsuarioDAO();
const moradorDAO = new MoradorDAO();
const admDAO = new ADMDAO();
const pontoDAO = new PontoColetaDAO();
const materialDAO = new MaterialDAO();
const recompensaDAO = new RecompensaDAO();
const entregaDAO = new EntregaDAO();
const itemEntregaDAO = new ItemEntregaDAO();
const resgateDAO = new ResgateDAO();


function executarDAO(dao, metodo, parametro) {
    return new Promise((resolve, reject) => {
        if (!dao || typeof dao[metodo] !== 'function') {
            return reject(
                new Error(`Método ${metodo} não encontrado no DAO.`)
            );
        }

        const callback = (erro, resultado) => {
            if (erro) {
                reject(erro);
            } else {
                resolve(resultado);
            }
        };

        try {
            if (parametro === undefined) {
                dao[metodo](callback);
            } else {
                dao[metodo](parametro, callback);
            }
        } catch (erro) {
            reject(erro);
        }
    });
}


async function verificarAdmin(cpf) {
    if (!cpf) {
        return false;
    }

    const [resultado] = await banco.query(
        `SELECT cpf
         FROM ADM
         WHERE cpf = ? AND status_adm = TRUE`,
        [cpf]
    );

    return resultado.length > 0;
}



async function exigirAdmin(req, res) {
    const adminCpf =
        (req.body && req.body.adminCpf) ||
        (req.query && req.query.adminCpf);

    try {
        const autorizado = await verificarAdmin(adminCpf);

        if (!autorizado) {
            res.status(403).json({
                mensagem: 'Acesso permitido somente para administradores ativos.'
            });

            return false;
        }

        return true;

    } catch (erro) {
        console.error('Erro ao verificar administrador:', erro);

        res.status(500).json({
            mensagem: 'Erro ao verificar permissões.'
        });

        return false;
    }
}



module.exports = {
    banco,

    executarDAO,
    verificarAdmin,
    exigirAdmin,

    usuarioDAO,
    moradorDAO,
    admDAO,
    pontoDAO,
    materialDAO,
    recompensaDAO,
    entregaDAO,
    itemEntregaDAO,
    resgateDAO,

    
    Usuario,
    Morador,
    ADM,
    PontoColeta,
    Material,
    Recompensa,
    Entrega,
    ItemEntrega,
    Resgate
};
