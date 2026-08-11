package br.com.sol7.olimpio.professor.nota.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "edc_nota")
public class Nota extends PanacheEntity {

    @Column(name = "id_nota_matricula")
    public Long notaMatriculaId;  // referencia a NotaMatricula (id, cross-service)
    @Column(name = "id_nota_grau")
    public Long notaGrauId;  // referencia a NotaGrau (id, cross-service)
    @Column(name = "id_nota_componente_curricular_matricula")
    public Long notaComponenteCurricularMatriculaId;  // referencia a NotaComponenteCurricularMatricula (id, cross-service)
    @Column(name = "nota")
    public BigDecimal nota;
    @Column(name = "id_conceito_notas")
    public Long notaConceitoId;  // referencia a GrauConceito (id, cross-service)
    @Column(name = "ordem")
    public int ordem;
}
