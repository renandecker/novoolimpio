alter table fin_custo_servico add column if not exists tipo_sms int;
update fin_custo_servico set tipo_sms = 0 where tipo_sms is null;

alter table fin_custo_servico add column if not exists tipo_ligacao int;
update fin_custo_servico set tipo_ligacao = 0 where tipo_ligacao is null;

alter table fin_custo_servico add column if not exists tipo_email int;
update fin_custo_servico set tipo_email = 0 where tipo_email is null;
