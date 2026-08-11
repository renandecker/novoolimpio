package br.com.sol7.olimpio.financeiro.fundocaixa;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class FundoCaixaRepository implements PanacheRepository<FundoCaixa> {}