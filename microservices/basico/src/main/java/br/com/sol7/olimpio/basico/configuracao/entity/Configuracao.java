package br.com.sol7.olimpio.basico.configuracao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "configuracao")
public class Configuracao extends PanacheEntity {
    public String nome;
    public String dadosJson;
}