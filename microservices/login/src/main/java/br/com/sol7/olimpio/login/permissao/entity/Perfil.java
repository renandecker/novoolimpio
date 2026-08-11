package br.com.sol7.olimpio.login.permissao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_perfil")
public class Perfil extends PanacheEntityBase {
    @Id
    @Column(name = "id")
    public Long id;
    @Column(name = "hierarquia")
    public String hierarquia;
}
