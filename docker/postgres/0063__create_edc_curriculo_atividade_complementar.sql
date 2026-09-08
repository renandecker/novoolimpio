CREATE TABLE IF NOT EXISTS edc_curriculo_atividade_complementar
(
  id_curriculo              integer REFERENCES edc_curriculo(id),
  id_atividade_complementar integer REFERENCES edc_atividade_complementar(id),
  PRIMARY KEY (id_curriculo, id_atividade_complementar)
);
