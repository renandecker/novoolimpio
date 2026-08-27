package br.com.sol7.olimpio.basico.documento.service;

import br.com.sol7.olimpio.basico.documento.entity.DocumentoConfiguracao;
import br.com.sol7.olimpio.basico.documento.dto.DocumentoConfiguracaoRequest;
import br.com.sol7.olimpio.basico.documento.dto.DocumentoConfiguracaoResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class DocumentoConfiguracaoService {

    public Uni<DocumentoConfiguracaoResponse> salvar(DocumentoConfiguracaoRequest request) {
        var entity = new DocumentoConfiguracao();
        entity.id = UUID.randomUUID().getMostSignificantBits();
        entity.nome = request.nome();
        entity.descricao = request.descricao();
        entity.tipoRelatorio = request.tipoRelatorio();
        entity.arquivoModelo = request.arquivoModelo();
        entity.ativo = request.ativo();
        return Panache
            .withEntityManager(em -> em.persist(entity))
            .replaceWith(() -> toResponse(entity));
    }

    public Uni<List<DocumentoConfiguracaoResponse>> listar() {
        return DocumentoConfiguracao
            .findAll()
            .onItem()
            .transformToUni(item -> Uni.createFrom().item(toResponse(item)))
            .collect().asList();
    }

    public Uni<DocumentoConfiguracaoResponse> atualizar(Long id, DocumentoConfiguracaoRequest request) {
        return DocumentoConfiguracao
            .findById(id)
            .onItem()
            .ifNull().failWith(() -> new NotFoundException("Documento configuração not found"))
            .chain(entity -> {
                entity.nome = request.nome();
                entity.descricao = request.descricao();
                entity.tipoRelatorio = request.tipoRelatorio();
                entity.arquivoModelo = request.arquivoModelo();
                entity.ativo = request.ativo();
            })
            .replaceWith(() -> toResponse(entity));
    }

    public Uni<Void> deletar(Long id) {
        return DocumentoConfiguracao
            .findById(id)
            .onItem()
            .ifNull().failWith(() -> new NotFoundException("Documento configuração not found"))
            .chain(() -> Panache.delete(entity))
            .replaceWith(() -> Uni.createFrom().voidItem());
    }

    private DocumentoConfiguracaoResponse toResponse(DocumentoConfiguracao entity) {
        return new DocumentoConfiguracaoResponse(
            (long) entity.id,
            entity.nome,
            entity.descricao,
            entity.tipoRelatorio,
            entity.arquivoModelo,
            entity.ativo
        );
    }
}