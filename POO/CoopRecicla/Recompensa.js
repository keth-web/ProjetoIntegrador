class Recompensa {
    constructor(cod_recomp, registro_pontos, catalogo) {
        this.cod_recomp = cod_recomp;
        this.registro_pontos = registro_pontos;
        this.catalogo = catalogo;
    }
    getCod_recomp() { return this.cod_recomp; }
    setCod_recomp(v) { this.cod_recomp = v; }
    getRegistro_pontos() { return this.registro_pontos; }
    setRegistro_pontos(v) { this.registro_pontos = v; }
    getCatalogo() { return this.catalogo; }
    setCatalogo(v) { this.catalogo = v; }

    validar() {
        if (!this.cod_recomp || this.cod_recomp.length > 9)
            throw new Error('Código da recompensa inválido.');
        if (!Number.isInteger(this.registro_pontos) || this.registro_pontos <= 0)
            throw new Error('A quantidade de pontos deve ser um inteiro positivo.');
        if (!this.catalogo || this.catalogo.trim() === '' || this.catalogo.length > 50)
            throw new Error('O nome da recompensa é obrigatório e deve ter até 50 caracteres.');
        return true;
    }
}
module.exports = Recompensa;
