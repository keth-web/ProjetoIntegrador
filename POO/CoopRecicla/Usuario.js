
class Usuario {
    #cpf
    #tel
    #nome
    #email
    constructor(cpf, tel, nome, email) {
        this.#cpf = cpf;
        this.#tel = tel;
        this.#nome = nome;
        this.#email = email;
    }

    getCpf() {
        return this.#cpf;
    }

    setCpf(cpf) {
        this.#cpf = cpf;
    }

    getTel() {
        return this.#tel;
    }

    setTel(tel) {
        this.#tel = tel;
    }

    getNome() {
        return this.#nome;
    }

    setNome(nome) {
        this.#nome = nome;
    }

    getEmail() {
        return this.email;
    }

    setEmail(email) {
        this.email = email;
    }
}

module.exports = Usuario;
