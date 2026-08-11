package br.com.sol7.olimpio.professor.registroaula.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_registro_aula")
public class RegistroAula extends PanacheEntity {

    @Column(name = "id_ocorrencia_componente_curricular")
    public Long ocorrenciaComponenteCurricularId;  // referencia a OcorrenciaComponenteCurricular (id, cross-service)
    @Column(name = "descricao", columnDefinition = "text")
    public String descricao;
}
