package br.com.sol7.olimpio.comercial.tipocanal;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "com_tipo_canal")
public class TipoCanal extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
