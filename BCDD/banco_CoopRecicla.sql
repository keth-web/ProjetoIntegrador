drop database if not exists CoopRecicla;
create database CoopRecicla;
use CoopRecicla;


create table if not exists Usuario(
cpf varchar(11) not null,
tel varchar(11),
nome varchar(100) not null,
email varchar(50) not null,
primary key (cpf) 
);
create table if not exists Morador(
cpf varchar (11) not null ,
endereco varchar(100) not null,
pontos int not null default 0,
primary key(cpf),
foreign key(cpf) references Usuario (cpf)
);
create table if not exists ADM(
cpf varchar(11),
status_adm boolean,
primary key(cpf),
foreign key(cpf)references Usuario(cpf)
);

create table if not exists ponto_coleta(
id int auto_increment,
nome varchar(50),
end varchar(100),
tel varchar (11),
primary key (id)
);

create table  if not exists material (
tipo varchar(3),
ponto_kg int,
cod_m varchar(9),
primary key (cod_m)
);

create table  if not exists entrega(
id int,
cpf varchar (11),
cod_entrega varchar(9),
hora time,
total_pontos int,
data_a date,
primary key (cod_entrega),
foreign key (cpf) references Usuario (cpf),
foreign key (id) references ponto_coleta (id)
);


create table if not exists recompensa(
cod_recomp varchar (9),
registro_pontos int,
catalogo varchar(50),
primary key (cod_recomp)
);

create table  if not exists resgate(
cpf varchar (11) not null,
cod_resg varchar(9),
data_resg date,
primary key(cod_resg),
foreign key (cpf) references Usuario (cpf)
 foreign key (cod_recomp) references recompensa(cod_recomp)
);



create table if not exists item_entrega(
cod_m varchar (9),
cod_entrega varchar (9),
 codigoE varchar(9),
 kg decimal(5),
primary key (codigoE),
foreign key (cod_entrega) references entrega (cod_entrega),
foreign key(cod_m) references material (cod_m)
);


insert into Usuario values
('12345678901', '82999991111', 'João Silva', 'joao@gmail.com'),
('23456789012', '82988882222', 'Maria Santos', 'maria@gmail.com'),
('34567890123', '82977773333', 'Pedro Oliveira', 'pedro@gmail.com'),
('45678901234', '82966664444', 'Ana Costa', 'ana@gmail.com'),
('56789012345', '82955556666', 'Lucas Souza', 'lucas@gmail.com'),
('67890123456', '82944447777', 'Carla Lima', 'carla@gmail.com');
insert into Morador values
('12345678901', 'Rua das Flores, 120', 150),
('23456789012', 'Av. Brasil, 250', 300),
('34567890123', 'Rua do Sol, 80', 200),
('45678901234', 'Rua Verde, 45', 450);
insert into ADM values
('56789012345', TRUE),
('67890123456', FALSE);

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

insert into entrega (cpf, cod_entrega, hora, total_pontos, data_a, id) values
('12345678901', 'ENT000001', '08:30:00', 100, '2026-10-01', 1),
('23456789012', 'ENT000002', '09:15:00', 150, '2026-10-02', 2),
('34567890123', 'ENT000003', '10:00:00', 200, '2026-10-03', 3),
('45678901234', 'ENT000004', '11:30:00', 120, '2026-10-04', 4),
('56789012345', 'ENT000005', '14:00:00', 180, '2026-10-05', 5);

insert into resgate (cpf, cod_resg, data_resg) values
('12345678901', 'RES000001', '2026-10-06'),
('23456789012', 'RES000002', '2026-10-07'),
('34567890123', 'RES000003', '2026-10-08'),
('45678901234', 'RES000004', '2026-10-09'),
('56789012345', 'RES000005', '2026-10-10');

insert into recompensa (cod_recomp, registro_pontos, catalogo) values
('REC000001', 100, 'Garrafa reutilizável'),
('REC000002', 150, 'Ecobag'),
('REC000003', 200, 'Kit de reciclagem'),
('REC000004', 250, 'Muda de planta'),
('REC000005', 300, 'Caneca sustentável');

insert into item_entrega (cod_m, cod_entrega, codigoE, kg) values
('MAT000001', 'ENT000001', 'ITE000001', 5.00),
('MAT000002', 'ENT000002', 'ITE000002', 3.00),
('MAT000003', 'ENT000003', 'ITE000003', 4.00),
('MAT000004', 'ENT000004', 'ITE000004', 2.00),
('MAT000005', 'ENT000005', 'ITE000005', 6.00);

