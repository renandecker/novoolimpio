package br.com.sol7.olimpio.educacao.curriculounidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_curriculo_unidade")
@IdClass(CurriculoUnidadeId.class)
public class CurriculoUnidade {

    @Id
    @Column(name = "id_curriculo")
    public Long curriculoId;  // referencia a Curriculo (educacao, edc_curriculo)

    @Id
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (basico, bas_unidade; cross-service)
}
