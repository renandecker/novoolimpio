package br.com.sol7.olimpio.basico.agenda.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_agenda")
public class Agenda {
    @Id
    @GeneratedValue
    public Long id;
    @Column(name = "descricao", columnDefinition = "text")
    public String descricao;
    @Column(name = "proprio")
    public boolean proprio;
    @Column(name = "diasmmaximo")
    public boolean diasMaximo;
    @Column(name = "qtdediasmaximo")
    public int quantidadeDiasMaximo;
    @Column(name = "id_tipo_agenda", columnDefinition = "integer")
    public Long tipoAgendaId;
    @Column(name = "id_status_compromisso", columnDefinition = "integer")
    public Long statusCompromissoId;
    @Column(name = "id_ultimo_status_compromisso", columnDefinition = "integer")
    public Long statusCompromissoUltimoId;
    @Column(name = "id_unidade", columnDefinition = "integer")
    public Long unidadeId;
    @Column(name = "tempo_tolerancia", length = 5)
    public String tempoTolerancia;
}
