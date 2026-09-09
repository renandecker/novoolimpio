package br.com.sol7.olimpio.relatorios.medida.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_medida")
public class Medida extends PanacheEntity {

    @Column(name = "id_coluna")
    public Long estruturaColunaId;

    @Column(name = "id_estrutura")
    public Long estruturaId;

    @Column(name = "tipo", columnDefinition = "text")
    public String tipo;

    @Column(name = "tipo_info", columnDefinition = "text")
    public String tipoInfo;

    @Column(name = "nome_visualizacao", columnDefinition = "text")
    public String nomeVisualizacao;
}