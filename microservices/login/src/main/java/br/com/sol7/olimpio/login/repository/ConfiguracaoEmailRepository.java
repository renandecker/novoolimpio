package br.com.sol7.olimpio.login.repository;

import br.com.sol7.olimpio.login.entity.ConfiguracaoEmail;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ConfiguracaoEmailRepository implements PanacheRepository<ConfiguracaoEmail> {

    private static final String SQL_PRINCIPAL =
            "SELECT u.* FROM bas_email u WHERE u.fl_principal = true LIMIT 1";
    private static final String SQL_PRIMEIRO =
            "SELECT u.* FROM bas_email u ORDER BY u.id ASC LIMIT 1";

    public Uni<ConfiguracaoEmail> findConfiguracaoEmailPadrao() {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_PRINCIPAL, ConfiguracaoEmail.class)
                        .getResultList())
                .chain(list -> {
                    if (!list.isEmpty()) return Uni.createFrom().item(list.get(0));
                    return Panache.getSession()
                            .chain(session -> session.createNativeQuery(SQL_PRIMEIRO, ConfiguracaoEmail.class)
                                    .getResultList())
                            .map(first -> first.isEmpty() ? null : first.get(0));
                });
    }
}
