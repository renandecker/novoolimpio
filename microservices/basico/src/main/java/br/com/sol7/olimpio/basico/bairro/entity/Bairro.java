package br.com.sol7.olimpio.basico.bairro.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_bairro")
public class Bairro extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "id_cidade")
    public Long cidadeId;  // referencia a Cidade (id, cross-service)
}
