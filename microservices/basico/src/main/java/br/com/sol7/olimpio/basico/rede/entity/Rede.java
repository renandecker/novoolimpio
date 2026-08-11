package br.com.sol7.olimpio.basico.rede.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_rede")
public class Rede extends PanacheEntity {

    @Column(name = "id_layout")
    public Long layoutId;  // referencia a Layout (id, cross-service)
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "razao_social")
    public String razaoSocial;
    @Column(name = "nome_fantasia")
    public String nomeFantasia;
    @Column(name = "cnpj")
    public String cnpj;
    @Column(name = "numero")
    public String numero;
}
