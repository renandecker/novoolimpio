package br.com.sol7.olimpio.basico.estado.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_estado")
public class Estado extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "uf")
    public String uf;
    @Column(name = "id_pais")
    public Long paisId;  // referencia a Pais (id, cross-service)
}
