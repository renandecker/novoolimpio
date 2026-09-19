package br.com.sol7.olimpio.relatorios.indicadorgauge.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "rel_indicador_gauge")
public class IndicadorGauge extends PanacheEntity {

    @Column(name = "nome")
    public String nome;

    @Column(name = "sql_query", columnDefinition = "TEXT")
    public String sql;

    @Column(name = "configuracao", columnDefinition = "JSONB")
    public String configuracao;

    @Column(name = "data_criacao")
    public Date createdAt;

    @Column(name = "data_atualizacao")
    public Date updatedAt;
}