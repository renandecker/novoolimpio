package br.com.sol7.olimpio.professor.cadernochamada.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "edc_caderno_componente_curricular")
public class CadernoComponenteCurricular extends PanacheEntity {

    @Column(name = "id_ocorrencia_componente_curricular")
    public Long ocorrenciaComponenteCurricularId;  // referencia a OcorrenciaComponenteCurricular (id, cross-service)
    @Column(name = "id_matricula")
    public Long matriculaId;  // referencia a Matricula (id, cross-service)
    @Column(name = "data_alteracao")
    public Date dataAlteracao;
    /*
        n = nenhum registro
        p = presente
        m = meia presenca
        a = ausente
        t = atestado
        c = cancelado
        v = troca turma
        r = prorrogado
        i = irregular
        d = atrasado
    */
    @Column(name = "presenca")
    public Character presenca;
}
