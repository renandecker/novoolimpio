package br.com.sol7.olimpio.basico.auditoria.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.auditoria.entity.Auditoria;

@ApplicationScoped
public class AuditoriaRepository implements PanacheRepository<Auditoria> {
}