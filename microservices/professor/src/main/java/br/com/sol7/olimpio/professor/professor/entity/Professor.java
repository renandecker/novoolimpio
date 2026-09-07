package br.com.sol7.olimpio.professor.professor.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "edc_professor")
public class Professor extends PanacheEntity {

    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "fl_ativo")
    public Boolean ativo;
    @Column(name = "caderno_bola")
    public Boolean cadernoBola;
    @Column(name = "dt_inicio")
    public Date dataInicio;
    @Column(name = "dt_fim")
    public Date dataFim;

    @jakarta.persistence.Transient
    public String nome;
}
