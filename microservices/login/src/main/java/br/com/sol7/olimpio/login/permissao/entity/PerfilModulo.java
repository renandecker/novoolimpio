package br.com.sol7.olimpio.login.permissao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_perfil_modulo")
public class PerfilModulo extends PanacheEntityBase {
    @Id
    @Column(name = "id")
    public Long id;
    @Column(name = "id_perfil")
    public Long perfilId;
    @Column(name = "id_modulo")
    public Long moduloId;
    @Column(name = "novo")
    public Boolean novo;
    @Column(name = "editar")
    public Boolean editar;
    @Column(name = "remover")
    public Boolean remover;
    @Column(name = "relatorio")
    public Boolean relatorio;
}
