package br.com.sol7.olimpio.educacao.desistente;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "edc_desistente")
public class Desistente extends PanacheEntity {

    @Column(name = "descricao", columnDefinition = "text")
    public String descricao;
    @Column(name = "data_criacao")
    @Temporal(TemporalType.DATE)
    public Date dataCriacao;
    @Column(name = "id_pessoa_notificou")
    public Long pessoaFuncionarioId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "id_contrato")
    public Long contratoId;  // referencia a Contrato (id, cross-service)
    @Column(name = "id_motivo")
    public Long motivoId;  // referencia a Motivo (id, cross-service)
    @Column(name = "ativo")
    public boolean ativo;
}
