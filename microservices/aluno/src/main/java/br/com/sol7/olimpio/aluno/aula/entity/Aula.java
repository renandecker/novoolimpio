package br.com.sol7.olimpio.aluno.aula.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_aula")
public class Aula extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(name = "nome")
    public String nome;
    @Column(name = "descricao", columnDefinition = "text")
    public String descricao;
    @Column(name = "id_ocorrencia_componente_curricular")
    public Long ocorrenciaComponenteCurricularId;
}
