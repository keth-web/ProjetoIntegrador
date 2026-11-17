create view vw.infoALL as
select u.nome , u.cpf , u.tel , u.email , coalesce (m.pontos,0) as pontos , coalesce(a.status_adm,false) as status , coalesce(m.endereco,'Não Informado') as endereco 
from Usuario as u 
Left Join Morador as m ON u.cpf = m.cpf
Left JOIN ADM as a on 
u.cpf=a.cpf;

create view vw.loc as
select p.nome , p.end, p.tel , e.data_a , u.email
from ponto_coleta as p 
INNER Join entrega as e ON
p.id = e.id
INNER join Usuario as u on u.cpf = e.cpf;

create view vw.catalogo_recompensas as
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
