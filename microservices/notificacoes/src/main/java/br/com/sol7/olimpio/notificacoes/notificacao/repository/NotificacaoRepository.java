package br.com.sol7.olimpio.notificacoes.notificacao.repository;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.Notificacao;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class NotificacaoRepository implements PanacheRepository<Notificacao> {
}
