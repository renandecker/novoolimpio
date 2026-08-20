package br.com.sol7.olimpio.relatorios.relatorio;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "relatorio")
public class Relatorio extends PanacheEntity {
    public String nome;
    public String dadosJson;
}