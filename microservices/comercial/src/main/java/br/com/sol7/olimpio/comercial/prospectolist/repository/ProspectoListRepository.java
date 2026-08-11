package br.com.sol7.olimpio.comercial.prospectolist;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class ProspectoListRepository implements PanacheRepository<ProspectoList> {}