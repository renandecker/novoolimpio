package br.com.sol7.olimpio.relatorios.extrator;

import br.com.sol7.olimpio.relatorios.extrator.dto.ExportRequest;
import br.com.sol7.olimpio.relatorios.extrator.repository.ExtratorRepository;
import br.com.sol7.olimpio.relatorios.extrator.service.DocumentoGeneratorService;
import br.com.sol7.olimpio.relatorios.extrator.entity.Extrator;
import br.com.sol7.olimpio.relatorios.tabela.service.TabelaService;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;

@ApplicationScoped
public class ExportConsumer {

    @Inject
    ExtratorRepository repository;

    @Inject
    TabelaService tabelaService;

    @Inject
    DocumentoGeneratorService documentoService;

    @ConfigProperty(name = "relatorios.extrator.diretorio", defaultValue = "extrator")
    String diretorioArquivos;

    @Incoming("export-requests")
    @WithTransaction
    public Uni<Void> processarExportacao(ExportRequest request) {
        return repository.findById(request.extratorId()).onItem().ifNull()
                .failWith(() -> new NotFoundException("Extrator not found"))
                .invoke(extrator -> {
                    extrator.situacao = "Processando";
                    extrator.log = "Iniciando geração " + extrator.tipo + " em " + new Date();
                })
                .chain(extrator -> tabelaService.gerarSqlCompleto(request.tabelaId(), request.filtros())
                        .onItem().ifNull().failWith(() -> new NotFoundException("SQL não gerado"))
                        .chain(sql -> Uni.createFrom().item(() -> documentoService.gerar(extrator, sql, request.tipo(), diretorioArquivos, request.filtros()))
                                .runSubscriptionOn(Infrastructure.getDefaultWorkerPool()))
                        .invoke(file -> {
                            extrator.situacao = "Gerado";
                            extrator.dataFim = new Date();
                            extrator.log = "Gerado com sucesso " + new Date() + " - Arquivo: " + file.getName();
                        })
                        .onFailure().invoke(err -> {
                            extrator.situacao = "Erro";
                            extrator.dataFim = new Date();
                            extrator.log = "Erro ao gerar: " + err.getMessage();
                        })
                        .replaceWithVoid());
    }
}