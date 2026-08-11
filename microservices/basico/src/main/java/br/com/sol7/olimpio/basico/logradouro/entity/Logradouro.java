package br.com.sol7.olimpio.basico.logradouro.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_logradouro")
public class Logradouro extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "cep")
    public String cep;
    @Column(name = "tipo_logradouro")
    public String tipo;
    @Column(name = "complemento")
    public String complemento;
    @Column(name = "local")
    public String local;
    @Column(name = "longitude")
    public String longitude;
    @Column(name = "latitude")
    public String latitude;
    @Column(name = "id_bairro")
    public Long bairroId;  // referencia a Bairro (id, cross-service)
}
