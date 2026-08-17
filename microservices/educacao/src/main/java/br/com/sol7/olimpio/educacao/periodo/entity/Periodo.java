package br.com.sol7.olimpio.educacao.periodo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "edc_periodo")
public class Periodo extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "id_tipo_curso")
    public Long tipoCursoId;  // referencia a TipoCurso (id, cross-service)
    @Column(name = "data_inicio")
    @Temporal(TemporalType.DATE)
    public Date dataInicio;
    @Column(name = "data_fim")
    @Temporal(TemporalType.DATE)
    public Date dataFim;
    @Column(name = "frequencia_minima")
    public Integer frequenciaMinima;
    @Column(name = "media_sem_exame")
    public BigDecimal mediaSemExame;
    @Column(name = "media_final")
    public BigDecimal mediaFinal;
    @Column(name = "conceito_final")
    public String conceitoFinal;
}
