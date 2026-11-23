const Usuario = require('./Usuario');

class Morador extends Usuario {
    constructor(cpf, tel, nome, email, endereco, pontos = 0) {
        super(cpf, tel, nome, email);
        this.endereco = endereco;
        this.pontos = pontos;
    }

    getEndereco() {
        return this.endereco;
    }

    setEndereco(endereco) {
        this.endereco = endereco;
    }

    getPontos() {
        return this.pontos;
    }

    setPontos(pontos) {
        this.pontos = pontos;
    }

    validar() {
        if (!this.endereco || this.endereco.trim() === '') {
            throw new Error('O endereço é obrigatório.');
        }

        if (this.endereco.length > 100) {
            throw new Error('O endereço deve ter no máximo 100 caracteres.');
        }

        if (!Number.isInteger(this.pontos) || this.pontos < 0) {
            throw new Error('Os pontos devem ser um número inteiro não negativo.');
        }

        return true;
    }
}

module.exports = Morador;