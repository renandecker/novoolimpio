package br.com.sol7.olimpio.comercial.tipoacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "com_tipo_acao")
public class TipoAcao extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
