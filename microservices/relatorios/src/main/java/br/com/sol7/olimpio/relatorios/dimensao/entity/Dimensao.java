package br.com.sol7.olimpio.relatorios.dimensao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_dimensao")
public class Dimensao extends PanacheEntity {

    @Column(name = "tipo_dimensao", columnDefinition = "text")
    public String tipo;

    @Column(name = "tipo_info_dimensao", columnDefinition = "text")
    public String tipoInfo;

    @Column(name = "nome_visualizacao", columnDefinition = "text")
    public String nomeVisualizacao;

    @Column(name = "id_coluna")
    public Long estruturaColunaId;

    @Column(name = "id_estrutura")
    public Long estruturaId;
}