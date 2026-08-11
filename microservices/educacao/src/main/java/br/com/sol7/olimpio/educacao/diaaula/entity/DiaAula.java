package br.com.sol7.olimpio.educacao.diaaula;

import br.com.sol7.olimpio.educacao.tempoaula.TempoAula;
import br.com.sol7.olimpio.educacao.turnoeducacao.TurnoEducacao;
import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "edc_dia_aula")
public class DiaAula extends PanacheEntity {

    @Column(name = "id_dia_semana")
    public Long diaSemanaId;  // referencia a DiaSemana (basico, cross-service)
    @Column(name = "id_turno")
    public Long turnoEducacaoId;  // referencia a TurnoEducacao (educacao, edc_turno)
    @Column(name = "id_tempo_aula")
    public Long tempoAulaId;  // referencia a TempoAula (educacao, edc_tempo_aula)

    @Transient
    public TurnoEducacao turnoEducacao;
    @Transient
    public TempoAula tempoAula;
}
