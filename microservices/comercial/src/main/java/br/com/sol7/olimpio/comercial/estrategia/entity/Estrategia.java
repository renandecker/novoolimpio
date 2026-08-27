package br.com.sol7.olimpio.comercial.estrategia;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "com_estrategia")
public class Estrategia extends PanacheEntity {

    @Column(name = "descricao", length = 255, nullable = false)
    public String descricao;
}
