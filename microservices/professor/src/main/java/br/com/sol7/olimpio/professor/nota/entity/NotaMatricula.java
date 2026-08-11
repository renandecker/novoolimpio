package br.com.sol7.olimpio.professor.nota.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_nota_matricula")
public class NotaMatricula extends PanacheEntity {

    @Column(name = "id_grau_nota")
    public Long grauNotaId;  // referencia a GrauNota (id, cross-service)
    @Column(name = "id_grau_conceito")
    public Long grauConceitoId;  // referencia a GrauConceito (id, cross-service)
    @Column(name = "id_matricula")
    public Long matriculaId;  // referencia a Matricula (id, cross-service)
    @Column(name = "id_oferecimento_componente_curricular")
    public Long oferecimentoComponenteCurricularId;  // referencia a OferecimentoComponenteCurricular (id, cross-service)
    @Column(name = "nome")
    public String nome;
    @Column(name = "descricao")
    public String descricao;
}
