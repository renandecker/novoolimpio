package br.com.sol7.olimpio.educacao.tipomatrizcurricular;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_tipo_matriz_curricular")
public class TipoMatrizCurricular extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
