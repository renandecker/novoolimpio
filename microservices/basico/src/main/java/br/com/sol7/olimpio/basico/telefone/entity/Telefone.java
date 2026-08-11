package br.com.sol7.olimpio.basico.telefone.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_telefone")
public class Telefone extends PanacheEntity {

    @Column(name = "numero")
    public String numero;
    @Column(name = "token")
    public String token;
    @Column(name = "operadora")
    public String operadora;  // era Operadora (enum/embeddable) no legado
    @Column(name = "id_tipo_telefone")
    public Long tipoTelefoneId;  // referencia a TipoTelefone (id, cross-service)
}
