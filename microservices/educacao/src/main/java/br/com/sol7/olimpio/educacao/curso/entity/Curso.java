package br.com.sol7.olimpio.educacao.curso;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_curso")
public class Curso extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
}
