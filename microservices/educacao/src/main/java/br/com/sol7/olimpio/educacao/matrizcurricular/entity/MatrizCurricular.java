package br.com.sol7.olimpio.educacao.matrizcurricular;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_matriz_curricular")
public class MatrizCurricular extends PanacheEntity {

    @Column(name = "id_curriculo")
    public Long curriculoId;  // referencia a Curriculo (educacao, edc_curriculo)
    @Column(name = "id_componente_curricular")
    public Long componenteCurricularId;  // referencia a ComponenteCurricular (educacao)
    @Column(name = "id_grupo_componente_curricular")
    public Long grupoComponenteCurricularId;  // referencia a GrupoComponenteCurricular (educacao)
    @Column(name = "id_tipo_matriz_curricular")
    public Long tipoMatrizCurricularId;  // referencia a TipoMatrizCurricular (educacao)
    @Column(name = "id_modalidade")
    public Long modalidadeId;  // referencia a Modalidade (id, cross-service)
    @Column(name = "ordem")
    public Integer ordem;
}
