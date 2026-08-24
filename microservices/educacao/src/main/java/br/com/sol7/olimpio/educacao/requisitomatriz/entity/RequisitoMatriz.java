package br.com.sol7.olimpio.educacao.requisitomatriz;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_requisito_matriz")
public class RequisitoMatriz extends PanacheEntity {

    @Column(name = "id_matriz_curricular")
    public Long matrizCurricularId;  // componente que possui o requisito (edc_matriz_curricular)
    @Column(name = "id_matriz_curricular_requisito")
    public Long matrizCurricularRequisitoId;  // componente requisito/pre-requisito (edc_matriz_curricular)
    @Column(name = "tipo_requisito")
    public String tipoRequisito;  // legado: char(1) - P pre-requisito, C co-requisito, E equivalente
}
