package br.com.sol7.olimpio.comercial.configuracaomarketing;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class ConfiguracaoMarketingRepository implements PanacheRepository<ConfiguracaoMarketing> {}