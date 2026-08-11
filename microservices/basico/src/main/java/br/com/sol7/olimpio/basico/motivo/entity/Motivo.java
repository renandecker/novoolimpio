package br.com.sol7.olimpio.basico.motivo.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_motivo")
public class Motivo extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "style")
    public String style;
    @Column(name = "ativo")
    public boolean ativo;
}
