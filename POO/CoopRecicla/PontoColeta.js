class PontoColeta {
    constructor(id, nome, end, tel) {
        this.id = id;
        this.nome = nome;
        this.end = end;
        this.tel = tel;
    }
    getId() { return this.id; }
    setId(v) { this.id = v; }
    getNome() { return this.nome; }
    setNome(v) { this.nome = v; }
    getEnd() { return this.end; }
    setEnd(v) { this.end = v; }
    getTel() { return this.tel; }
    setTel(v) { this.tel = v; }

    validar() {
        if (!this.nome || this.nome.trim() === '' || this.nome.length > 50)
            throw new Error('O nome é obrigatório e deve ter até 50 caracteres.');
        if (!this.end || this.end.trim() === '' || this.end.length > 100)
            throw new Error('O endereço é obrigatório e deve ter até 100 caracteres.');
        if (this.tel && this.tel.length > 11)
            throw new Error('O telefone deve ter até 11 caracteres.');
        if (this.id !== null && this.id !== undefined && (!Number.isInteger(this.id) || this.id <= 0))
            throw new Error('ID do ponto de coleta inválido.');
        return true;
    }
}
module.exports = PontoColeta;
