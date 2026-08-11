package br.com.sol7.olimpio.basico.cidade.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_cidade")
public class Cidade extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "praca")
    public String praca;
    @Column(name = "area")
    public String area;
    @Column(name = "cod_ibge")
    public String ibge;
    @Column(name = "id_estado")
    public Long estadoId;  // referencia a Estado (id, cross-service)
}
