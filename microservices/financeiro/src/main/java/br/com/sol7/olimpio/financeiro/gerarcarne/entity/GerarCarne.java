package br.com.sol7.olimpio.financeiro.gerarcarne;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "gerar_carne")
public class GerarCarne extends PanacheEntity {
    public String nome;
    public String dadosJson;
}