package br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "edc_ocorrencia_componente_curricular")
public class OcorrenciaComponenteCurricular extends PanacheEntity {

    @Column(name = "id_professor")
    public Long professorId;  // referencia a Professor (id, cross-service)
    @Column(name = "id_sala")
    public Long salaId;  // referencia a Sala (id, cross-service)
    @Column(name = "fl_ativo")
    public boolean ativo;
    @Column(name = "id_oferecimento_componente_curricular")
    public Long oferecimentoComponenteCurricularId;  // referencia a OferecimentoComponenteCurricular (id, cross-service)
    @Column(name = "data")
    @Temporal(TemporalType.DATE)
    public Date data;
    @Column(name = "id_dia_aula")
    public Long diaAulaId;  // referencia a DiaAula (id, cross-service)
    @Column(name = "aula_coringa")
    public Boolean aulaCoringa;
    @Column(name = "aula_presencial")
    public Boolean aulaPresencial;
}
