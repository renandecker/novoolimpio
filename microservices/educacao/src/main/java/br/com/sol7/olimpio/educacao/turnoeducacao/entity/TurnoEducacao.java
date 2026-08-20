package br.com.sol7.olimpio.educacao.turnoeducacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalTime;

@Entity
@Table(name = "edc_turno")
public class TurnoEducacao extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "sucinto")
    public String sucinto;
    @Column(name = "inicio")
    public LocalTime inicio;
    @Column(name = "fim")
    public LocalTime fim;
}
