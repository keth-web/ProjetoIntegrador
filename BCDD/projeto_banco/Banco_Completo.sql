create database CoopRecicla;
use CoopRecicla;




create table if not exists Usuario(
cpf varchar(11) not null,
tel varchar(11),
nome varchar(100) not null,
email varchar(50) not null,
senha varchar(8) not null,
primary key (cpf) 
);
create table if not exists Morador(
cpf varchar (11) not null ,
endereco varchar(100) not null,
pontos int not null default 0,
primary key(cpf),
senha varchar(8) not null,
foreign key(cpf) references Usuario (cpf)
);
create table if not exists ADM(
cpf varchar(11),
status_adm boolean,
primary key(cpf),
senha varchar(8) not null,
foreign key(cpf)references Usuario(cpf)
);


create table if not exists ponto_coleta(
id int auto_increment,
nome varchar(50),
ende varchar(100),
tel varchar (11),
primary key (id)
);


create table  if not exists material (
tipo varchar(3) not null,
ponto_kg int,
cod_m varchar(9) not null,
primary key (cod_m)
);


create table  if not exists entrega(
id int not null,
cpf varchar (11) not null  ,
cod_entrega varchar(9),
hora time,
total_pontos int,
data_a date,
primary key (cod_entrega),
foreign key (cpf) references Morador (cpf),
foreign key (id) references ponto_coleta (id)
);




create table if not exists recompensa(
cod_recomp varchar (9) not null ,
registro_pontos int not null,
catalogo varchar(50) not null ,
primary key (cod_recomp)
);


create table  if not exists resgate(
cod_recomp varchar (9) not null ,
 cpf varchar (11) not null,
cod_resg varchar(9),
data_resg date not null ,
primary key(cod_resg),
foreign key (cpf) references Morador (cpf),
foreign key (cod_recomp) references recompensa(cod_recomp)
);






create table if not exists item_entrega(
cod_m varchar (9) not null ,
cod_entrega varchar (9) not null ,
 codigoE varchar(9) not null ,
 kg decimal(7,2) not null,
primary key (codigoE),
foreign key (cod_entrega) references entrega (cod_entrega),
foreign key(cod_m) references material (cod_m)
);


INSERT INTO Usuario (cpf, tel, nome, email, senha)
VALUES
('12345678901', '82999991111', 'João Silva', 'joao@gmail.com', 'Jo@1234!'),
('23456789012', '82988882222', 'Maria Santos', 'maria@gmail.com', 'Ma@2345!'),
('34567890123', '82977773333', 'Pedro Oliveira', 'pedro@gmail.com', 'Pe@3456!'),
('45678901234', '82966664444', 'Ana Costa', 'ana@gmail.com', 'An@4567!'),
('56789012345', '82955556666', 'Lucas Souza', 'lucas@gmail.com', 'Lu@5678!'),
('67890123456', '82944447777', 'Carla Lima', 'carla@gmail.com', 'Ca@6789!'),
('78901234567', '82933334444', 'Fernanda Alves', 'fernanda@gmail.com', 'Fe@7890!'),
('89012345678', '82922225555', 'Rafael Martins', 'rafael@gmail.com', 'Ra@8901!'),
('90123456789', '82911116666', 'Beatriz Rocha', 'beatriz@gmail.com', 'Be@9012!'),
('01234567890', '82900007777', 'Gabriel Ferreira', 'gabriel@gmail.com', 'Ga@0123!');






INSERT INTO Morador (cpf, endereco, pontos, senha)
VALUES
('12345678901', 'Rua das Flores, 120', 150, 'Jo@1234!'),
('23456789012', 'Av. Brasil, 250', 300, 'Ma@2345!'),
('34567890123', 'Rua do Sol, 80', 200, 'Pe@3456!'),
('45678901234', 'Rua Verde, 45', 450, 'An@4567!'),
('56789012345', 'Rua Nova, 200', 100, 'Lu@5678!'),
('67890123456', 'Rua das Palmeiras, 90', 180, 'Ca@6789!'),
('78901234567', 'Rua Azul, 150', 220, 'Fe@7890!'),
('89012345678', 'Av. Nordeste, 400', 350, 'Ra@8901!'),
('90123456789', 'Rua das Acácias, 70', 160, 'Be@9012!'),
('01234567890', 'Rua Esperança, 300', 280, 'Ga@0123!');


INSERT INTO ADM (cpf, status_adm, senha)
VALUES
('56789012345', TRUE, 'Lu@5678!'),
('67890123456', FALSE, 'Ca@6789!');


insert into ponto_coleta (nome, ende, tel) values
('Eco Ponto Centro', 'Rua Principal, 100', '82999990001'),
('Recicla Mais', 'Av. Brasil, 250', '82999990002'),
('Ponto Verde', 'Rua das Flores, 50', '82999990003'),
('Sustentabilidade', 'Av. Central, 300', '82999990004'),
('Eco Vida', 'Rua Nova, 120', '82999990005'),
('Eco Recicla', 'Rua da Paz, 100', '82999990006'),
('Verde Futuro', 'Av. das Árvores, 200', '82999990007'),
('Reciclagem Total', 'Rua do Comércio, 80', '82999990008'),
('Ponto Sustentável', 'Av. Esperança, 350', '82999990009'),
('Eco Nordeste', 'Rua da União, 500', '82999990010');


insert into material (tipo, ponto_kg, cod_m) values
('PET', 10, 'MAT000001'),
('PAP', 5, 'MAT000002'),
('VID', 8, 'MAT000003'),
('LAT', 15, 'MAT000004'),
('PLA', 7, 'MAT000005'),
('PET', 12, 'MAT000006'),
('PAP', 6, 'MAT000007'),
('VID', 9, 'MAT000008'),
('LAT', 18, 'MAT000009'),
('PLA', 11, 'MAT000010');


insert into entrega (cpf, cod_entrega, hora, total_pontos, data_a, id) values
('12345678901', 'ENT000001', '08:30:00', 100, '2026-10-01', 1),
('23456789012', 'ENT000002', '09:15:00', 150, '2026-10-02', 2),
('34567890123', 'ENT000003', '10:00:00', 200, '2026-10-03', 3),
('45678901234', 'ENT000004', '11:30:00', 120, '2026-10-04', 4),
('12345678901', 'ENT000005', '14:00:00', 180, '2026-10-05', 5),
('67890123456', 'ENT000006', '08:00:00', 130, '2026-10-11', 6),
('78901234567', 'ENT000007', '09:30:00', 160, '2026-10-12', 7),
('89012345678', 'ENT000008', '10:30:00', 190, '2026-10-13', 8),
('90123456789', 'ENT000009', '13:00:00', 140, '2026-10-14', 9),
('01234567890', 'ENT000010', '15:00:00', 210, '2026-10-15', 10);


insert into recompensa (cod_recomp, registro_pontos, catalogo) values
('REC000001', 100, 'Garrafa reutilizável'),
('REC000002', 150, 'Ecobag'),
('REC000003', 200, 'Kit de reciclagem'),
('REC000004', 250, 'Muda de planta'),
('REC000005', 300, 'Caneca sustentável'),
('REC000006', 120, 'Sacola ecológica'),
('REC000007', 180, 'Caderno reciclado'),
('REC000008', 220, 'Kit de sementes'),
('REC000009', 280, 'Vaso sustentável'),
('REC000010', 350, 'Composteira doméstica');


insert into resgate (cpf, cod_recomp, cod_resg, data_resg) values
('12345678901', 'REC000001', 'RES000001', '2026-10-06'),
('23456789012', 'REC000002', 'RES000002', '2026-10-07'),
('34567890123', 'REC000003', 'RES000003', '2026-10-08'),
('45678901234', 'REC000004', 'RES000004', '2026-10-09'),
('56789012345', 'REC000005', 'RES000005', '2026-10-10'),
('67890123456', 'REC000006', 'RES000006', '2026-10-16'),
('78901234567', 'REC000007', 'RES000007', '2026-10-17'),
('89012345678', 'REC000008', 'RES000008', '2026-10-18'),
('90123456789', 'REC000009', 'RES000009', '2026-10-19'),
('01234567890', 'REC000010', 'RES000010', '2026-10-20');


insert into item_entrega (cod_m, cod_entrega, codigoE, kg) values
('MAT000001', 'ENT000001', 'ITE000001', 5.00),
('MAT000002', 'ENT000002', 'ITE000002', 3.00),
('MAT000003', 'ENT000003', 'ITE000003', 4.00),
('MAT000004', 'ENT000004', 'ITE000004', 2.00),
('MAT000005', 'ENT000005', 'ITE000005', 6.00),
('MAT000006', 'ENT000006', 'ITE000006', 4.00),
('MAT000007', 'ENT000007', 'ITE000007', 5.00),
('MAT000008', 'ENT000008', 'ITE000008', 3.50),
('MAT000009', 'ENT000009', 'ITE000009', 6.00),
('MAT000010', 'ENT000010', 'ITE000010', 4.50);




create view vw_infoALL as
select u.nome , u.cpf , u.tel , u.email , coalesce (m.pontos,0) as pontos , coalesce(a.status_adm,false) as status , coalesce(m.endereco,'Não Informado') as endereco 
from Usuario as u 
Left Join Morador as m ON u.cpf = m.cpf
Left JOIN ADM as a on 
u.cpf=a.cpf;


create view vw_loc as
select p.nome , p.ende, p.tel , e.data_a , u.email
from ponto_coleta as p 
INNER Join entrega as e ON
p.id = e.id
INNER join Usuario as u on u.cpf = e.cpf;


create view vw_catalogo_recompensas as
select
r.cod_recomp,
r.catalogo,
r.registro_pontos,
res.data_resg
from recompensa as r
left join resgate as res on r.cod_recomp = res.cod_recomp;


select cpf, count(*) as quantidade_entregas
from entrega
group by cpf;


select * from vw_loc ;
select * from vw_infoALL;
select * from vw_catalogo_recompensas;


insert into Usuario (
    cpf,
    nome,
    email,
    tel,
    senha
)
values (
    '11223344556',
    'Administrador Geral',
    'cinfoksv@gmail.com',
    '82999673531',
    'KSV1234@'
);

insert into ADM (
    cpf,
    status_adm,
    senha
)
values (
    '11223344556',
    true,
    'KSV1234@'
);

