package br.com.sol7.olimpio.educacao.atividadecomplementar;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_atividade_complementar")
public class AtividadeComplementar extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "carga_horaria")
    public Integer cargaHoraria;
    @Column(name = "id_tipo_atividade")
    public Long tipoAtividadeId;  // referencia a TipoAtividade (id, cross-service)
}
