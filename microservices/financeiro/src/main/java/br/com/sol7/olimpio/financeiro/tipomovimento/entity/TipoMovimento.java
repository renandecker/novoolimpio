package br.com.sol7.olimpio.financeiro.tipomovimento;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_tipo_movimento")
public class TipoMovimento extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
