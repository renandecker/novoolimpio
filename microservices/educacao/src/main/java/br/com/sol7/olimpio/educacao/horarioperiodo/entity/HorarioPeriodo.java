package br.com.sol7.olimpio.educacao.horarioperiodo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.time.LocalTime;
import java.util.Date;

@Entity
@Table(name = "edc_horario_periodo")
public class HorarioPeriodo extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "id_periodo")
    public Long periodoId;  // referencia a Periodo (id, cross-service)
    @Column(name = "id_turno")
    public Long turnoEducacaoId;  // referencia a TurnoEducacao (id, cross-service)
    @Column(name = "dt_inicio")
    @Temporal(TemporalType.DATE)
    public Date dataInicio;
    @Column(name = "dt_fim")
    @Temporal(TemporalType.DATE)
    public Date dataFim;
    @Column(name = "hora_inicio")
    public LocalTime horaInicio;
    @Column(name = "hora_fim")
    public LocalTime horaFim;
    @Column(name = "minutos_aula_diario")
    public int minutosAulaDiario;
    @Column(name = "minutos_aula")
    public int minutosAula;
}
