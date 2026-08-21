package br.com.sol7.olimpio.relatorios.documento.repository;

import br.com.sol7.olimpio.relatorios.documento.entity.DocumentTemplate;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public interface DocumentTemplateRepository extends PanacheRepository<DocumentTemplate> {

    Uni<List<DocumentTemplate>> findByTipoRelatorioAndRelatorioId(String tipoRelatorio, Long relatorioId);

    Uni<List<DocumentTemplate>> findByAtivoTrue();

    Uni<Long> deleteByRelatorioId(Long relatorioId);
}