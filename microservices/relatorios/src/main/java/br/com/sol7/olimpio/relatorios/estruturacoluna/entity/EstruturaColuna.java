package br.com.sol7.olimpio.relatorios.estruturacoluna;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_coluna")
public class EstruturaColuna extends PanacheEntity {

    @Column(name = "coluna", columnDefinition = "text")
    public String coluna;

    @Column(name = "id_estrutura")
    public Long estruturaId;
}