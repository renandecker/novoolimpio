package br.com.sol7.olimpio.basico.tipocompromisso.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_tipo_compromisso")
public class TipoCompromisso extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
