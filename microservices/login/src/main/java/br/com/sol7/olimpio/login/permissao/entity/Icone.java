package br.com.sol7.olimpio.login.permissao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_icone")
public class Icone extends PanacheEntityBase {
    @Id
    @Column(name = "id")
    public Long id;

    @Column(name = "classe", nullable = false)
    public String classe;

    @Column(name = "icone", nullable = false)
    public String icone;

    @Column(name = "versao", nullable = false)
    public String versao;

    @Column(name = "search", length = 2000)
    public String search;
}