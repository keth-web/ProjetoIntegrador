class Resgate {
    constructor(cod_recomp, cpf, cod_resg, data_resg) {
        this.cod_recomp = cod_recomp;
        this.cpf = cpf;
        this.cod_resg = cod_resg;
        this.data_resg = data_resg;
    }
    getCod_recomp() { return this.cod_recomp; }
    setCod_recomp(v) { this.cod_recomp = v; }
    getCpf() { return this.cpf; }
    setCpf(v) { this.cpf = v; }
    getCod_resg() { return this.cod_resg; }
    setCod_resg(v) { this.cod_resg = v; }
    getData_resg() { return this.data_resg; }
    setData_resg(v) { this.data_resg = v; }

    validar() {
        if (!this.cod_recomp || this.cod_recomp.length > 9)
            throw new Error('Código da recompensa inválido.');
        if (!this.cpf || this.cpf.length !== 11)
            throw new Error('CPF deve possuir 11 caracteres.');
        if (!this.cod_resg || this.cod_resg.length > 9)
            throw new Error('Código do resgate inválido.');
        if (!this.data_resg)
            throw new Error('A data do resgate é obrigatória.');
        return true;
    }
}
module.exports = Resgate;
