package br.com.sol7.olimpio.relatorios.basico.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_usuario")
public class BasUsuario extends PanacheEntity {

    @Column(name = "login")
    public String login;

    @Column(name = "id_pessoa_fisica")
    public Long pessoaFisicaId;

    public static Uni<BasUsuario> findByLogin(String login) {
        return find("login = ?1", login).firstResult();
    }

    public static Uni<Long> findIdByLogin(String login) {
        return find("SELECT id FROM BasUsuario WHERE login = ?1", login).project(Long.class).firstResult();
    }
}