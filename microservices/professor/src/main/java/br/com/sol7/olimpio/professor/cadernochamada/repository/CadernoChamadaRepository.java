package br.com.sol7.olimpio.professor.cadernochamada.repository;
import br.com.sol7.olimpio.professor.cadernochamada.entity.CadernoChamada;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class CadernoChamadaRepository implements PanacheRepository<CadernoChamada> {}
