package br.com.sol7.olimpio.educacao.apresentacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_apresentacao")
public class Apresentacao extends PanacheEntity {

    @Column(name = "ordem")
    public int ordem;
    @Column(name = "local")
    public String local;
}
