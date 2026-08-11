package br.com.sol7.olimpio.financeiro.tipomovimento;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class TipoMovimentoRepository implements PanacheRepository<TipoMovimento> {}