package br.com.sol7.olimpio.basico.disponibilidadepessoa.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.disponibilidadepessoa.entity.DisponibilidadePessoa;
@ApplicationScoped public class DisponibilidadePessoaRepository implements PanacheRepository<DisponibilidadePessoa> {}