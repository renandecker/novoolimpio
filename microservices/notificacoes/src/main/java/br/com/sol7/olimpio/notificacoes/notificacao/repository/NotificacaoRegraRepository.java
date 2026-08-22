package br.com.sol7.olimpio.notificacoes.notificacao.repository;

import br.com.sol7.olimpio.notificacoes.notificacao.entity.NotificacaoRegra;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class NotificacaoRegraRepository implements PanacheRepository<NotificacaoRegra> {

    public Uni<NotificacaoRegra> findByTipoRegraAndCanal(String tipoRegra, String canal) {
        return find("tipoRegra = ?1 and canal = ?2", tipoRegra, canal).firstResult();
    }

    public Uni<NotificacaoRegra> findByNomeAndAtivo(String nome, boolean ativo) {
        return find("nome = ?1 and ativo = ?2", nome, ativo).firstResult();
    }

    public Uni<java.util.List<NotificacaoRegra>> findByAtivoTrueOrderByNome() {
        return find("ativo = ?1 order by nome", true).list();
    }
}