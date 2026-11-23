
const Usuario = require('./Usuario')
const Morador = require('./Morador')
const Material = require('./Material')
const Entrega = require('./Entrega')

const usuario = new Usuario('12345678900', '82999999999', 'Ana', 'ana@email.com')

const morador = new Morador('12345678900', '82999999999', 'Ana', 'ana@email.com', 'Rua A', 100)

const material = new Material('MAT001', 'PET', 10)

const entrega = new Entrega(
    1,
    '12345678900',
    'ENT001',
    '10:30:00',
    50,
    '2026-11-13'
)

console.log(usuario)
console.log(morador)
console.log(material)
console.log(entrega)