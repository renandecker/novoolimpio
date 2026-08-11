package br.com.sol7.olimpio.basico.modulo.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_modulo")
public class Modulo extends PanacheEntity {

    @Column(name = "id_modulo")
    public Long antecessorId;  // referencia a Modulo (id, cross-service)
    @Column(name = "rotulo")
    public String rotulo;
    @Column(name = "descricao")
    public String descricao;
    @Column(name = "icone")
    public String icone;
    @Column(name = "ajuda", columnDefinition = "text")
    public String ajuda;
    @Column(name = "outcome")
    public String outcome;
    @Column(name = "ordem")
    public Integer ordem;
}
