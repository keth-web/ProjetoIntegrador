class ItemEntrega {
    constructor(cod_m, cod_entrega, codigoE, kg) {
        this.cod_m = cod_m;
        this.cod_entrega = cod_entrega;
        this.codigoE = codigoE;
        this.kg = kg;
    }
    getCod_m() { return this.cod_m; }
    setCod_m(v) { this.cod_m = v; }
    getCod_entrega() { return this.cod_entrega; }
    setCod_entrega(v) { this.cod_entrega = v; }
    getCodigoE() { return this.codigoE; }
    setCodigoE(v) { this.codigoE = v; }
    getKg() { return this.kg; }
    setKg(v) { this.kg = v; }

    validar() {
        if (!this.cod_m || this.cod_m.length > 9) throw new Error('Código do material inválido.');
        if (!this.cod_entrega || this.cod_entrega.length > 9) throw new Error('Código da entrega inválido.');
        if (!this.codigoE || this.codigoE.length > 9) throw new Error('Código do item inválido.');
        if (typeof this.kg !== 'number' || !Number.isFinite(this.kg) || this.kg <= 0)
            throw new Error('O peso deve ser maior que zero.');
        return true;
    }
}
module.exports = ItemEntrega;
