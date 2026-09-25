package br.com.sol7.olimpio.login.repository;

import br.com.sol7.olimpio.login.entity.Login;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;

@ApplicationScoped
public class LoginRepository implements PanacheRepository<Login> {
    public Uni<Login> findByUsername(String username) {
        return find("username", username.trim().toLowerCase()).firstResult();
    }

    public Uni<String> findEmailByUsername(String username) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery("""
                        SELECT p.email
                        FROM bas_login l
                        LEFT JOIN bas_usuario u ON u.id = l.id_usuario
                        LEFT JOIN bas_pessoa p ON p.id = u.id_pessoa
                        WHERE lower(l.username) = lower(?1)
                        LIMIT 1
                        """, Tuple.class)
                        .setParameter(1, username)
                        .getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null ? null : ((Tuple) list.get(0)).get("email", String.class));
    }

    public Uni<Tuple> perfilPorUsername(String username) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery("""
                        SELECT COALESCE(u.foto_base64, '') AS foto_base64,
                        COALESCE(p.email, '') AS email,
                        COALESCE(f.nome, '') AS nome,
                        COALESCE(f.cpf, '') AS cpf,
                        COALESCE(u.hierarquia, '') AS hierarquia
                        FROM bas_login l
                        LEFT JOIN bas_usuario u ON u.id = l.id_usuario
                        LEFT JOIN bas_pessoa p ON p.id = u.id_pessoa
                        LEFT JOIN bas_pessoa_fisica f ON f.id_pessoa = p.id
                        WHERE lower(l.username) = lower(?1)
                        LIMIT 1
                        """, Tuple.class)
                        .setParameter(1, username)
                        .getResultList())
                .map(list -> list.isEmpty() ? null : (Tuple) list.get(0));
    }
}