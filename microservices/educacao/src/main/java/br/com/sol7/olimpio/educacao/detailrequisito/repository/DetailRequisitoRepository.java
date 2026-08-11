package br.com.sol7.olimpio.educacao.detailrequisito;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class DetailRequisitoRepository implements PanacheRepository<DetailRequisito> {}