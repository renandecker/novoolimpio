package br.com.sol7.olimpio.educacao.basetecnologica;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_base_tecnologica")
public class BaseTecnologica extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "nome")
    public String nome;
}
