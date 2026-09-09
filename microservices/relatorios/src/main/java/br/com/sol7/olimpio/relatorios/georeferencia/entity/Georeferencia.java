package br.com.sol7.olimpio.relatorios.georeferencia.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_georeferencia")
public class Georeferencia extends PanacheEntity {

    @Column(name = "nome_visualizacao", columnDefinition = "text")
    public String nomeVisualizacao;

    @Column(name = "id_coluna")
    public Long estruturaColunaId;

    @Column(name = "id_estrutura")
    public Long estruturaId;
}