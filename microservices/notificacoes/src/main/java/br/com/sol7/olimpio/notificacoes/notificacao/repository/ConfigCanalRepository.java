package br.com.sol7.olimpio.notificacoes.notificacao.repository;

import br.com.sol7.olimpio.notificacoes.notificacao.entity.ConfigCanal;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ConfigCanalRepository implements PanacheRepository<ConfigCanal> {

    public Uni<ConfigCanal> findByCanal(String canal) {
        return find("canal", canal.toUpperCase().trim()).firstResult();
    }
}
