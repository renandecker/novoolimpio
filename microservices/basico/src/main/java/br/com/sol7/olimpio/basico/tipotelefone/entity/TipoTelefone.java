package br.com.sol7.olimpio.basico.tipotelefone.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_tipo_telefone")
public class TipoTelefone extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
