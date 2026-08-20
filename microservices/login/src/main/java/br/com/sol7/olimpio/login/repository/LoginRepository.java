package br.com.sol7.olimpio.login.repository;

import br.com.sol7.olimpio.login.entity.Login;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

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
                        WHERE lower(l.username) = lower( ? 1)
                        LIMIT 1
                        """)
                                .setParameter(1, username)
                                .getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null ? null : list.get(0).toString().trim());
    }

    public Uni<Object[]> perfilPorUsername(String username) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery("""
                        SELECT COALESCE(u.foto_base64, ''),
                        COALESCE(p.email, ''),
                        COALESCE(f.nome, ''),
                        COALESCE(f.cpf, ''),
                        COALESCE(u.hierarquia, '')
                        FROM bas_login l
                        LEFT JOIN bas_usuario u ON u.id = l.id_usuario
                        LEFT JOIN bas_pessoa p ON p.id = u.id_pessoa
                        LEFT JOIN bas_pessoa_fisica f ON f.id_pessoa = p.id
                        WHERE lower(l.username) = lower( ? 1)
                        LIMIT 1
                        """)
                                .setParameter(1, username)
                                .getResultList())
                .map(list -> list.isEmpty() ? null : (Object[]) list.get(0));
    }
}