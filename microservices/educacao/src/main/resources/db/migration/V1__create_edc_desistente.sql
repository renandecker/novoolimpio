CREATE TABLE edc_desistente
(
    id bigserial PRIMARY KEY,
    id_pessoa_aluno bigint,
    id_pessoa_notificou bigint,
    id_contrato bigint,
    id_motivo bigint,
    descricao text,
    data_criacao date,
    ativo boolean DEFAULT true
);

CREATE INDEX idx_edc_desistente_pessoa_aluno ON edc_desistente(id_pessoa_aluno);
CREATE INDEX idx_edc_desistente_pessoa_notificou ON edc_desistente(id_pessoa_notificou);
CREATE INDEX idx_edc_desistente_contrato ON edc_desistente(id_contrato);
CREATE INDEX idx_edc_desistente_motivo ON edc_desistente(id_motivo);