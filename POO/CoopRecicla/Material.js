
class Material {
    constructor(cod_m, tipo, ponto_kg) {
        this.cod_m = cod_m;
        this.tipo = tipo;
        this.ponto_kg = ponto_kg;
    }

    getCod_m() {
        return this.cod_m;
    }

    setCod_m(cod_m) {
        this.cod_m = cod_m;
    }

    getTipo() {
        return this.tipo;
    }

    setTipo(tipo) {
        this.tipo = tipo;
    }

    getPonto_kg() {
        return this.ponto_kg;
    }

    setPonto_kg(ponto_kg) {
        this.ponto_kg = ponto_kg;
    }

    validar() {
        if (!this.cod_m || this.cod_m.length > 9) {
            throw new Error('O código do material é obrigatório e deve ter até 9 caracteres.');
        }
        if (!this.tipo || this.tipo.trim() === '' || this.tipo.length > 3) {
            throw new Error('O tipo é obrigatório e deve ter até 3 caracteres.');
        }
        if (!Number.isInteger(this.ponto_kg) || this.ponto_kg <= 0) {
            throw new Error('A pontuação por kg deve ser um número inteiro positivo.');
        }
        return true;
    }
}
module.exports = Material;