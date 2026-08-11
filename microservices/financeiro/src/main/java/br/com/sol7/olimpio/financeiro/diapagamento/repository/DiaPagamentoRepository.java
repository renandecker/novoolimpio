package br.com.sol7.olimpio.financeiro.diapagamento;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class DiaPagamentoRepository implements PanacheRepository<DiaPagamento> {}