class ADM {
    constructor(cpf, status_adm, senha) {
        this.cpf = cpf;
        this.status_adm = status_adm;
        this.senha = senha;
    }
    getCpf() { return this.cpf; }
    setCpf(v) { this.cpf = v; }
    getStatus_adm() { return this.status_adm; }
    setStatus_adm(v) { this.status_adm = v; }
    getSenha() { return this.senha; }
    setSenha(v) { this.senha = v; }

    validar() {
        if (!this.cpf || this.cpf.length !== 11)
            throw new Error('CPF deve possuir 11 caracteres.');
        if (typeof this.status_adm !== 'boolean')
            throw new Error('O status do administrador deve ser verdadeiro ou falso.');
        if (!this.senha || this.senha.length !== 8)
            throw new Error('A senha deve possuir 8 caracteres.');
        return true;
    }
}
module.exports = ADM;
