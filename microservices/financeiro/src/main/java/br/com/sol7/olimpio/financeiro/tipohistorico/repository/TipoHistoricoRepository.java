package br.com.sol7.olimpio.financeiro.tipohistorico;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class TipoHistoricoRepository implements PanacheRepository<TipoHistorico> {}