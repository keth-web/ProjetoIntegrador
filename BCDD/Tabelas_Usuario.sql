CREATE DATABASE IF NOT EXISTS cooprecicla;
use cooprecicla;

create table if not exists Usuario(
cpf varchar(11) not null,
tel varchar(11),
nome varchar(100) not null,
email varchar(50) not null,
primary key (cpf) 
);
create table if not exists Morador(
cpf varchar(11),
endereco varchar(100),
pontos int,
primary key(cpf),
foreign key(cpf) references Usuario (cpf)
);
create table if not exists ADM(
cpf varchar(11),
status_adm boolean,
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