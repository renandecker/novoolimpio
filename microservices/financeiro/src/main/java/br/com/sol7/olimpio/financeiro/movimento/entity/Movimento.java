package br.com.sol7.olimpio.financeiro.movimento;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_movimento")
public class Movimento extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "descricaocompleta")
    public String descricaocompleta;
    @Column(name = "id_movimento")
    public Long movimentoId;  // referencia a Movimento (id, cross-service)
    @Column(name = "id_tipo_movimento")
    public Long tipoMovimentoId;  // referencia a TipoMovimento (id, cross-service)
}
