package br.com.sol7.olimpio.professor.nota.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "edc_nota_componente_curricular_matricula")
public class NotaComponenteCurricularMatricula extends PanacheEntity {

    @Column(name = "id_matricula")
    public Long matriculaId;  // referencia a Matricula (id, cross-service)
    @Column(name = "nota")
    public BigDecimal nota;
    @Column(name = "id_conceito_notas")
    public Long notaConceitoId;  // referencia a GrauConceito (id, cross-service)
    @Column(name = "id_grau_nota")
    public Long grauNotaId;  // referencia a GrauNota (id, cross-service)
    @Column(name = "id_grau_conceito")
    public Long grauConceitoId;  // referencia a GrauConceito (id, cross-service)
}
