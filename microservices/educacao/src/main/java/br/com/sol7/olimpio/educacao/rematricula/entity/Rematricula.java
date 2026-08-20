package br.com.sol7.olimpio.educacao.rematricula;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rematricula")
public class Rematricula extends PanacheEntity {
    public String nome;
    public String dadosJson;
}