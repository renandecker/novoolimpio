delete from bas_perfil_modulo where id_modulo in (select id from bas_modulo where outcome like '%modeloCarta%');
delete from bas_modulo where outcome like '%modeloCarta%';
drop table if exists fin_modelo_carta_aud cascade;
drop table if exists fin_modelo_carta cascade;
drop sequence if exists fin_modelo_carta_id_seq cascade;
