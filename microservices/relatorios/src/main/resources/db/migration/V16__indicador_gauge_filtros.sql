-- V16__indicador_gauge_filtros.sql
-- Vincula os filtros (rel_filtro) aos indicadores gauge, permitindo que a tela
-- /view/indicador/listIndicadorGauge e /view/relatorios/viewIndicadorGauge
-- apliquem os mesmos filtros usados nas demais views de relatório.

CREATE TABLE IF NOT EXISTS rel_filtro_indicador_gauge (
    id                  BIGSERIAL PRIMARY KEY,
    id_indicador_gauge  BIGINT NOT NULL,
    id_filtro           BIGINT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_rel_filtro_indicador_gauge
    ON rel_filtro_indicador_gauge (id_indicador_gauge, id_filtro);

CREATE INDEX IF NOT EXISTS idx_rel_filtro_indicador_gauge_filtro
    ON rel_filtro_indicador_gauge (id_filtro);
