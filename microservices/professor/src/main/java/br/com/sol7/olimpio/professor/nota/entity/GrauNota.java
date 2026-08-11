package br.com.sol7.olimpio.professor.nota.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "edc_grau_nota")
public class GrauNota extends PanacheEntity {

    @Column(name = "id_grau")
    public Long grauId;  // referencia a Grau (id, cross-service)
    @Column(name = "numero_nota")
    public Integer numeroNota;
    @Column(name = "peso")
    public BigDecimal peso;
    @Column(name = "nome")
    public String nome;
    @Column(name = "descricao")
    public String descricao;
    @Column(name = "qtde_nota")
    public Integer qtdeNota;
    @Column(name = "qtde_nota_aluno")
    public Integer qtdeNotaAluno;
}
