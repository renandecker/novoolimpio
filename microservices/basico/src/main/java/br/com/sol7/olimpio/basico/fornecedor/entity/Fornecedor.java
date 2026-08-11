package br.com.sol7.olimpio.basico.fornecedor.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_fornecedor")
public class Fornecedor extends PanacheEntity {

    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "longitude")
    public double longitude;
    @Column(name = "latitude")
    public double latitude;
}
