package br.com.sol7.olimpio.central.tipopausa;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cen_tipo_pausa")
public class TipoPausa extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "qtde_tempo")
    public Integer tempo;
}
