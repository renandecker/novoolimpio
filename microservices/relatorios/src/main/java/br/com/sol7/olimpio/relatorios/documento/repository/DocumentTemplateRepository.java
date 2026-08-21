package br.com.sol7.olimpio.relatorios.documento.repository;

import br.com.sol7.olimpio.relatorios.documento.entity.DocumentTemplate;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class DocumentTemplateRepository implements PanacheRepository<DocumentTemplate> {

    public Uni<List<DocumentTemplate>> findByTipoRelatorioAndRelatorioId(String tipoRelatorio, Long relatorioId) {
        return find("tipoRelatorio = ?1 and relatorioId = ?2", tipoRelatorio, relatorioId).list();
    }

    public Uni<List<DocumentTemplate>> findByAtivoTrue() {
        return find("ativo = true").list();
    }

    public Uni<Long> deleteByRelatorioId(Long relatorioId) {
        return delete("relatorioId = ?1", relatorioId);
    }
}