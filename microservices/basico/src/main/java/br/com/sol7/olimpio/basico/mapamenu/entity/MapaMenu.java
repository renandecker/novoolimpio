package br.com.sol7.olimpio.basico.mapamenu.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "mapa_menu")
public class MapaMenu extends PanacheEntity {
    public String nome;
    public String dadosJson;
}