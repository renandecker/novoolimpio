package br.com.sol7.olimpio.relatorios.envio;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "envio")
public class Envio extends PanacheEntity {
    public String nome;
    public String dadosJson;
}