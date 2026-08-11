package br.com.sol7.olimpio.educacao.grupocomponentecurricular;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_grupo_componente_curricular")
public class GrupoComponenteCurricular extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
