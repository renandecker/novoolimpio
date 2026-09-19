package br.com.sol7.olimpio.basico.compromisso.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "bas_compromisso")
public class Compromisso extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "data")
    @Temporal(TemporalType.DATE)
    public Date data;
    @Column(name = "id_horario")
    public Long horarioId;  // referencia a Horario (id, cross-service)
    @Column(name = "id_tipo_compromisso")
    public Long tipoCompromissoId;  // referencia a TipoCompromisso (id, cross-service)
    @Column(name = "id_agenda")
    public Long agendaId;  // referencia a Agenda (id, cross-service)
    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "data_chegada")
    @Temporal(TemporalType.TIMESTAMP)
    public Date dataChegada;
    @Column(name = "data_alteracao")
    @Temporal(TemporalType.DATE)
    public Date dataAlteracao;
    @Column(name = "data_inicio")
    @Temporal(TemporalType.TIMESTAMP)
    public Date dataInicio;
    @Column(name = "data_conclusao")
    @Temporal(TemporalType.TIMESTAMP)
    public Date dataConclusao;
    @Column(name = "observacao")
    public String observacao;
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_status_compromisso")
    public Long statusCompromissoId;  // referencia a StatusCompromisso (id, cross-service)
    @Column(name = "id_prospecto")
    public Long prospectoId;  // referencia a Prospecto (id, cross-service)
    @Column(name = "id_atendente")
    public Long atendenteId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_usuario_finalizou")
    public Long usuarioFinalizouId;  // referencia a Usuario (id, cross-service)
}
