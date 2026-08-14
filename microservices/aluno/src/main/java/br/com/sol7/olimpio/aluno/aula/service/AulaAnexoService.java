package br.com.sol7.olimpio.aluno.aula.service;

import br.com.sol7.olimpio.aluno.aula.entity.AulaAnexo;
import br.com.sol7.olimpio.aluno.aula.repository.AulaAnexoRepository;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaAnexoResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class AulaAnexoService {

    @Inject
    AulaAnexoRepository repository;

    public Uni<List<AulaAnexoResponse>> anexosDaAula(Long aulaId) {
        return repository.anexosDaAula(aulaId).map(items -> items.stream().map(this::toResponse).toList());
    }

    private AulaAnexoResponse toResponse(AulaAnexo e) {
        return new AulaAnexoResponse(e.id, e.aulaId, e.nome, e.anexo, e.tipo);
    }
}
