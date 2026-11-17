CREATE DATABASE IF NOT EXISTS cooprecicla;
use cooprecicla;

create table(
cpf varchar(11) not null,
tel varchar(11),
nome varchar(100) not null,
email varchar(50) not null,
primary key (cpf) 
);
create table(
cpf varchar (11) not null ,
endereco varchar(100) not null,
pontos int not null default 0,
primary key(cpf),
foreign key(cpf) references Usuario (cpf)
);
create table if not exists ADM(
cpf varchar(11) not null,
status_adm boolean not null default true,
primary key(cpf),
foreign key(cpf)references Usuario(cpf)
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
insert into usuario values
('78901234567', '82933334444', 'Carlos Alves', 'carlos@gmail.com');

select * from usuario;

update usuario
set nome = 'Carlos Souza'
where cpf = '78901234567';

delete from usuario
where cpf = '78901234567';


insert into usuario values
('78901234567', '82933334444', 'Carlos Alves', 'carlos@gmail.com');

insert into morador values
('78901234567', 'Rua Nova, 100', 100);

select * from morador;

update morador
set endereco = 'Rua Nova, 200',
pontos = 250
where cpf = '78901234567';

delete from morador
where cpf = '78901234567';


insert into usuario values
('78901234567', '82933334444', 'Carlos Alves', 'carlos@gmail.com');

insert into adm values
('78901234567', true);

select * from adm;

update adm
set status_adm = false
where cpf = '78901234567';

delete from adm
where cpf = '78901234567';
