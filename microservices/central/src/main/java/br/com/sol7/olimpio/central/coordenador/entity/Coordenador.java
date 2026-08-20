package br.com.sol7.olimpio.central.coordenador;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "coordenador")
public class Coordenador extends PanacheEntity {
    public String nome;
    public String dadosJson;
}