-- Dominio Empresa/Curriculo (cur_*) - portado de V1_4_583__curriculo.sql.
-- Aplicado pelo container 'restore' apos o olimpio.sql no banco 'olimpio'.
-- Versao idempotente para ser reexecutada com seguranca (restore + flyway do login).

create table IF NOT EXISTS cur_curriculo_trabalho
(
  id           serial not null
    constraint cur_curriculo_trabalho_pkey
    primary key,
  id_pessoa    integer
    constraint cur_curriculo_trabalho_id_pessoa_fkey
    references bas_pessoa,
  dt_inicio    date,
  dt_fim       date,
  fl_ativo     boolean
);

create table IF NOT EXISTS cur_empresa
(
  id integer  primary key,
  id_pessoa   integer REFERENCES bas_pessoa(id),
  dt_inicio    date,
  dt_fim       date,
  fl_ativo     boolean
);

create table IF NOT EXISTS cur_empresa_unidade
(
  id  integer  primary key,
  id_empresa bigint references cur_empresa(id),
  id_unidade     integer REFERENCES bas_unidade(id),
  inicio           time,
  fim              time,
  pre_autorizado   boolean,
  id_tipo_contrato    integer REFERENCES edc_tipo_contrato(id)
);

CREATE TABLE IF NOT EXISTS cur_vaga
(
  id BIGSERIAL PRIMARY KEY,
  nome text,
  descricao text,
  titulo_email text,
  assunto_email text,
  data_inicio date,
  data_fim date,
  vagas int,
  id_usuario integer REFERENCES bas_usuario(id),
  fl_ativo boolean,
  fl_exibir_vaga boolean,
  fl_email boolean,
  data_envio timestamp
);


CREATE TABLE IF NOT EXISTS cur_vaga_perfil(
  id_perfil integer REFERENCES bas_perfil(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  primary key(id_perfil, id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_perfil') THEN
        alter table cur_vaga_perfil
          add constraint uk_cur_vaga_perfil unique (id_perfil, id_vaga);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_vaga_unidade(
  id_unidade integer REFERENCES bas_unidade(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  primary key(id_unidade, id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_unidade') THEN
        alter table cur_vaga_unidade
          add constraint uk_cur_vaga_unidade unique (id_unidade, id_vaga);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_vaga_componente(
  id_componente integer REFERENCES edc_componente_curricular(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  primary key(id_componente, id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_componente') THEN
        alter table cur_vaga_componente
          add constraint uk_cur_vaga_componente unique (id_componente, id_vaga);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_vaga_oferecimento(
  id_oferecimento integer REFERENCES edc_oferecimento_componente_curricular(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  primary key(id_oferecimento, id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_oferecimento') THEN
        alter table cur_vaga_oferecimento
          add constraint uk_cur_vaga_oferecimento unique (id_oferecimento, id_vaga);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_vaga_grupo(
  id_grupo integer REFERENCES edc_grupo(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  primary key(id_grupo, id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_grupo') THEN
        alter table cur_vaga_grupo
          add constraint uk_cur_vaga_grupo unique (id_grupo, id_vaga);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_vaga_curriculo(
  id_curriculo integer REFERENCES edc_curriculo(id),
  id_vaga integer REFERENCES cur_vaga(id),
  primary key(id_curriculo,id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_curriculo') THEN
        alter table cur_vaga_curriculo
          add constraint uk_cur_vaga_curriculo unique (id_curriculo, id_vaga);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_vaga_empresa(
  id_empresa integer REFERENCES cur_empresa(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  primary key(id_empresa, id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_empresa') THEN
        alter table cur_vaga_empresa
          add constraint uk_cur_vaga_empresa unique (id_empresa, id_vaga);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_vaga_usuario(
  id_usuario integer REFERENCES bas_usuario(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  primary key(id_usuario, id_vaga)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_vaga_usuario') THEN
        alter table cur_vaga_usuario
          add constraint uk_cur_vaga_usuario unique (id_usuario, id_vaga);
    END IF;
END
$$;


CREATE TABLE IF NOT EXISTS cur_entrevista_vaga_empresa
(
  id BIGSERIAL PRIMARY KEY,
  id_usuario integer REFERENCES bas_usuario(id),
  id_vaga bigint REFERENCES cur_vaga(id),
  id_empresa bigint REFERENCES cur_empresa(id),
  token varchar(200),
  fl_email_enviado_aluno boolean,
  fl_email_enviado_empresa boolean,
  fl_resposta boolean,
  data_final date,
  data_aceite_aluno timestamp
  );

CREATE TABLE IF NOT EXISTS cur_entrevista_vaga_empresa_agenda(
  id_agenda integer REFERENCES bas_agenda(id),
  id_entrevista_vaga_empresa bigint REFERENCES cur_entrevista_vaga_empresa(id),
  primary key(id_entrevista_vaga_empresa, id_agenda)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_cur_entrevista_vaga_empresa_agenda') THEN
        alter table cur_entrevista_vaga_empresa_agenda
          add constraint uk_cur_entrevista_vaga_empresa_agenda unique (id_entrevista_vaga_empresa, id_agenda);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS cur_configuracao_empresa(
  id serial primary key,
  arquivo_curriculo text,
  sql_variavel text
);

create table IF NOT EXISTS cur_curriculo_campo
(
  id          bigserial not null
    constraint cur_curriculo_campo_pkey
    primary key,
  id_campo    integer
    constraint cur_curriculo_campo_id_campo_fkey
    references com_campo,
  obrigatorio boolean,
  ordem       integer
);

create table IF NOT EXISTS cur_curriculo_campo_informacao
(
  id         bigserial not null
    constraint cur_curriculo_campo_informacao_pkey
    primary key,
  valor      text,
  id_curriculo_trabalho integer
    constraint cur_curriculo_campo_informacao_id_curriculo_trabalho_fkey
    references cur_curriculo_trabalho,
  id_campo   integer
    constraint cur_curriculo_campo_informacao_id_campo_fkey
    references com_campo
);

-- Sequences usadas pelo Hibernate (default de PanacheEntity: <table>_seq, allocationSize 50).
-- O legado serial/bigserial criou <table>_id_seq; o Hibernate nao as usa (espera <table>_seq).
create sequence if not exists cur_configuracao_empresa_seq increment by 50;
create sequence if not exists cur_curriculo_campo_seq increment by 50;
create sequence if not exists cur_curriculo_campo_informacao_seq increment by 50;
create sequence if not exists cur_curriculo_trabalho_seq increment by 50;
create sequence if not exists cur_empresa_seq increment by 50;
create sequence if not exists cur_empresa_unidade_seq increment by 50;
create sequence if not exists cur_entrevista_vaga_empresa_seq increment by 50;
create sequence if not exists cur_vaga_seq increment by 50;
create sequence if not exists cur_vaga_perfil_seq increment by 50;
create sequence if not exists cur_vaga_unidade_seq increment by 50;
create sequence if not exists cur_vaga_componente_seq increment by 50;
create sequence if not exists cur_vaga_oferecimento_seq increment by 50;
create sequence if not exists cur_vaga_grupo_seq increment by 50;
create sequence if not exists cur_vaga_curriculo_seq increment by 50;
create sequence if not exists cur_vaga_empresa_seq increment by 50;
create sequence if not exists cur_vaga_usuario_seq increment by 50;
create sequence if not exists cur_entrevista_vaga_empresa_agenda_seq increment by 50;

-- Join tables do legado usam PK composta; o PanacheEntity exige coluna 'id'. Adiciona id serial a cada join.
alter table cur_vaga_perfil add column IF NOT EXISTS id bigserial;
alter table cur_vaga_unidade add column IF NOT EXISTS id bigserial;
alter table cur_vaga_componente add column IF NOT EXISTS id bigserial;
alter table cur_vaga_oferecimento add column IF NOT EXISTS id bigserial;
alter table cur_vaga_grupo add column IF NOT EXISTS id bigserial;
alter table cur_vaga_curriculo add column IF NOT EXISTS id bigserial;
alter table cur_vaga_empresa add column IF NOT EXISTS id bigserial;
alter table cur_vaga_usuario add column IF NOT EXISTS id bigserial;
alter table cur_entrevista_vaga_empresa_agenda add column IF NOT EXISTS id bigserial;

-- Controle de progresso dos envios (usado por SchedulingJobs.enviarVagasAlunos/EnviarVagasEmpresa).
-- bas_config.chave nao tem constraint UNIQUE, entao usa NOT EXISTS em vez de ON CONFLICT (chave).
insert into bas_config (chave,valor) select 'ID_VAGA_EMPRESA','0' where not exists (select 1 from bas_config where chave = 'ID_VAGA_EMPRESA');
insert into bas_config (chave,valor) select 'ID_VAGA_ALUNO','0' where not exists (select 1 from bas_config where chave = 'ID_VAGA_ALUNO');
