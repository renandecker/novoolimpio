package br.com.sol7.olimpio.comercial.prospectoradar;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "prospecto_radar")
public class ProspectoRadar extends PanacheEntity {
    public String nome;
    public String dadosJson;
}