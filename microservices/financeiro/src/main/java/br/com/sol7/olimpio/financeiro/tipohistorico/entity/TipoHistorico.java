package br.com.sol7.olimpio.financeiro.tipohistorico;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_tipo_historico")
public class TipoHistorico extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
