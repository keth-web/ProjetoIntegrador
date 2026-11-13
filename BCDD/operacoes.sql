drop database CoopRecicla;
create database CoopRecicla;
use CoopRecicla;


create table entrega(
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

create table recompensa(
cod_recomp varchar (9),
registro_pontos int,
catalogo varchar(50),
primary key (cod_recomp)
);

create table resgate(
cpf varchar (11) not null,
cod_resg varchar(9),
data_resg date,
primary key(cod_resg),
foreign key (cpf) references Usuario (cpf)
foreign key (cod_recomp) references recompensa(cod_recomp)
);



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



