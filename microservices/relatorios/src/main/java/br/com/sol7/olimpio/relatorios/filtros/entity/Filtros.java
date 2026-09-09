package br.com.sol7.olimpio.relatorios.filtros.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "filtros")
public class Filtros extends PanacheEntity {
    public String nome;
    public String dadosJson;
}