package br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_curriculo_atividade_complementar")
@IdClass(CurriculoAtividadeComplementarId.class)
public class CurriculoAtividadeComplementar {

    @Id
    @Column(name = "id_curriculo")
    public Long curriculoId;

    @Id
    @Column(name = "id_atividade_complementar")
    public Long atividadeComplementarId;
}
