
class Entrega {
    constructor(id, cpf, cod_entrega, hora, total_pontos, data_a) {
        this.id = id;
        this.cpf = cpf;
        this.cod_entrega = cod_entrega;
        this.hora = hora;
        this.total_pontos = total_pontos;
        this.data_a = data_a;
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    getCpf() {
        return this.cpf;
    }

    setCpf(cpf) {
        this.cpf = cpf;
    }

    getCod_entrega() {
        return this.cod_entrega;
    }

    setCod_entrega(cod_entrega) {
        this.cod_entrega = cod_entrega;
    }

    getHora() {
        return this.hora;
    }

    setHora(hora) {
        this.hora = hora;
    }

    getTotal_pontos() {
        return this.total_pontos;
    }

    setTotal_pontos(total_pontos) {
        this.total_pontos = total_pontos;
    }

    getData_a() {
        return this.data_a;
    }

    setData_a(data_a) {
        this.data_a = data_a;
    }

    validar() {
    if (!this.cpf || this.cpf.length !== 11) {
        throw new Error('CPF deve possuir 11 caracteres.');
    }

    if (!this.cod_entrega || this.cod_entrega.length > 9) {
        throw new Error('Código da entrega inválido.');
    }

    if (!Number.isInteger(this.id) || this.id <= 0) {
        throw new Error('Ponto de coleta inválido.');
    }

    if (!Number.isInteger(this.total_pontos) || this.total_pontos < 0) {
        throw new Error('Pontuação inválida.');
    }

    if (!this.hora || !this.data_a) {
        throw new Error('Hora e data são obrigatórias.');
    }

    return true;
}
}

module.exports = Entrega;
