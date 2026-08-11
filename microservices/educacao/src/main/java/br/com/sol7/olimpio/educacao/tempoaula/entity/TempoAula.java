package br.com.sol7.olimpio.educacao.tempoaula;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_tempo_aula")
public class TempoAula extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "minutos_aula")
    public int minutosAula;
    @Column(name = "minutos")
    public int minutos;
}
