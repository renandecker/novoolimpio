package br.com.sol7.olimpio.relatorios.cores;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_cores")
public class Cores extends PanacheEntity {

    @Column(name = "fundo")
    public String fundo;
    @Column(name = "texto")
    public String texto;
}
