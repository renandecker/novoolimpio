package br.com.sol7.olimpio.educacao.horarioperiodo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class HorarioPeriodoRepository implements PanacheRepository<HorarioPeriodo> {}