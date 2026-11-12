create table item_entrega(
cod_m varchar (9),
cod_entrega varchar (9),
 codigoE varchar(9),
 kg decimal(5),
primary key (codigoE),
foreign key (cod_entrega) references entrega (cod_entrega),
foreign key(cod_m) references material (cod_m)
);

create table ponto_coleta(
id int auto_increment,
nome varchar(50),
end varchar(100),
tel varchar (11),
primary key (id)
);

create table material (
tipo varchar(3),
ponto_kg int,
cod_m varchar(9),
primary key (cod_m)
);


insert into item_entrega (cod_m, cod_entrega, codigoE, kg) values
('MAT000001', 'ENT000001', 'ITE000001', 5.00),
('MAT000002', 'ENT000002', 'ITE000002', 3.00),
('MAT000003', 'ENT000003', 'ITE000003', 4.00),
('MAT000004', 'ENT000004', 'ITE000004', 2.00),
('MAT000005', 'ENT000005', 'ITE000005', 6.00);

insert into ponto_coleta (nome, `end`, tel) values
('Eco Ponto Centro', 'Rua Principal, 100', '82999990001'),
('Recicla Mais', 'Av. Brasil, 250', '82999990002'),
('Ponto Verde', 'Rua das Flores, 50', '82999990003'),
('Sustentabilidade', 'Av. Central, 300', '82999990004'),
('Eco Vida', 'Rua Nova, 120', '82999990005');

insert into material (tipo, ponto_kg, cod_m) values
('PET', 10, 'MAT000001'),
('PAP', 5, 'MAT000002'),
('VID', 8, 'MAT000003'),
('LAT', 15, 'MAT000004'),
('PLA', 7, 'MAT000005');
