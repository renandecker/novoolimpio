package br.com.sol7.olimpio.notificacoes.notificacao.repository;

import br.com.sol7.olimpio.notificacoes.notificacao.entity.PreferenciaNotificacaoUsuario;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;

import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class PreferenciaNotificacaoUsuarioRepository implements PanacheRepository<PreferenciaNotificacaoUsuario> {

    public Uni<List<PreferenciaNotificacaoUsuario>> findByUsername(String username) {
        return find("username = ?1 order by categoria, tipo, canal", username).list();
    }

    public Uni<List<PreferenciaNotificacaoUsuario>> findByUsernameAndCategoria(String username, String categoria) {
        return find("username = ?1 and categoria = ?2 order by tipo, canal", username, categoria).list();
    }

    public Uni<PreferenciaNotificacaoUsuario> findByUsernameCategoriaTipoCanal(String username, String categoria, String tipo, String canal) {
        return find("username = ?1 and categoria = ?2 and tipo = ?3 and canal = ?4", username, categoria, tipo, canal)
                .firstResult();
    }

    public Uni<Void> deleteByUsername(String username) {
        return delete("username = ?1", username).replaceWithVoid();
    }

    public Uni<Void> deleteByUsernameAndCategoria(String username, String categoria) {
        return delete("username = ?1 and categoria = ?2", username, categoria).replaceWithVoid();
    }
}