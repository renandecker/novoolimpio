package br.com.sol7.olimpio.financeiro.codigoverificador;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class CodigoVerificadorRepository implements PanacheRepository<CodigoVerificador> {}