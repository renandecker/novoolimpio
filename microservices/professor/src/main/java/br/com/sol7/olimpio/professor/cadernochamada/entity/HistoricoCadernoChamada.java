package br.com.sol7.olimpio.professor.cadernochamada.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "edc_historico_caderno_chamada")
public class HistoricoCadernoChamada extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "data")
    public Date data;
    @Column(name = "id_matricula")
    public Long matriculaId;  // referencia a Matricula (id, cross-service)
    @Column(name = "id_ocorrencia_componente_curricular")
    public Long ocorrenciaComponenteCurricularId;  // referencia a OcorrenciaComponenteCurricular (id, cross-service)
    @Column(name = "presenca_anterior")
    public Character presencaAnterior;
    @Column(name = "presenca_posterior")
    public Character presencaPosterior;
}
