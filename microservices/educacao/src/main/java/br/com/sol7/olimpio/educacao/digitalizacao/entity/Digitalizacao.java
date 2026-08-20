package br.com.sol7.olimpio.educacao.digitalizacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "digitalizacao")
public class Digitalizacao extends PanacheEntity {
    public String nome;
    public String dadosJson;
}