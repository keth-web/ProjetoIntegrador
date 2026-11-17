drop database CoopRecicla;
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
cod_recomp varchar (9),
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
cod_m varchar (9),
cod_entrega varchar (9),
 codigoE varchar(9),
 kg decimal(7,2) not null,
primary key (codigoE),
foreign key (cod_entrega) references entrega (cod_entrega),
foreign key(cod_m) references material (cod_m)
);
