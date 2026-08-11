package br.com.sol7.olimpio.educacao.sala;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_sala")
public class Sala extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "sucinto")
    public String sucinto;
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_tipo_sala")
    public Long tipoSalaId;  // referencia a TipoSala (id, cross-service)
    @Column(name = "qtd_alunos")
    public Integer quantidadeAlunos;
    @Column(name = "predio")
    public Integer predio;
    @Column(name = "andar")
    public Integer andar;
    @Column(name = "numero")
    public Integer numero;
    @Column(name = "fl_ar_condicionado")
    public Boolean arCondicionado;
    @Column(name = "fl_ensalamento_automatico")
    public Boolean ensalamentoAutomatico;
}
