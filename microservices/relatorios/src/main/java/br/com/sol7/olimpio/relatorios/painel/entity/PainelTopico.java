package br.com.sol7.olimpio.relatorios.painel.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_painel_topico")
public class PainelTopico extends PanacheEntity {

    @Column(name = "id_painel")
    public Long painelId;

    @Column(name = "id_tabela")
    public Long tabelaId;

    @Column(name = "id_grafico")
    public Long graficoId;

    @Column(name = "id_mapa")
    public Long mapaId;

    @Column(name = "ordem")
    public Integer ordem;
}