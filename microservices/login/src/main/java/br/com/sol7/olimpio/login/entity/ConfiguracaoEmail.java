package br.com.sol7.olimpio.login.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_email")
public class ConfiguracaoEmail extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "host")
    public String host;

    @Column(name = "port")
    public Integer port;

    @Column(name = "username")
    public String username;

    @Column(name = "password")
    public String password;

    @Column(name = "tls")
    public Boolean tls;

    @Column(name = "ssl")
    public Boolean ssl;

    @Column(name = "fl_principal")
    public Boolean principal;
}
