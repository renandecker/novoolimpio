package br.com.sol7.olimpio.relatorios.indicadorgauge.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "rel_indicador_gauge")
public class IndicadorGauge extends PanacheEntity {

    @Column(name = "nome", nullable = false, length = 255)
    public String nome;

    @Column(name = "sql", nullable = false, columnDefinition = "TEXT")
    public String sql;

    @Column(name = "configuracao", columnDefinition = "JSONB", nullable = false)
    public String configuracao;

    @Column(name = "fl_ativo")
    public Boolean flAtivo = true;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    public Date createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    public Date updatedAt;

    @Column(name = "created_by")
    public Long createdBy;

    @Column(name = "updated_by")
    public Long updatedBy;
}