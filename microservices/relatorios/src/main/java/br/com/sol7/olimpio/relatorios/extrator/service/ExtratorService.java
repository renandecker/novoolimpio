package br.com.sol7.olimpio.relatorios.extrator.service;
import br.com.sol7.olimpio.relatorios.extrator.controller.ExtratorController;

import br.com.sol7.olimpio.relatorios.extrator.dto.ExportRequest;
import br.com.sol7.olimpio.relatorios.extrator.ExportProducer;
import br.com.sol7.olimpio.relatorios.extrator.repository.ExtratorRepository;
import br.com.sol7.olimpio.relatorios.extrator.entity.Extrator;
import br.com.sol7.olimpio.relatorios.extrator.dto.ExtratorRequest;
import br.com.sol7.olimpio.relatorios.extrator.dto.ExtratorResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.File;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class ExtratorService {

    @Inject
    ExtratorRepository repository;

    @Inject
    ExportProducer exportProducer;

    @ConfigProperty(name = "relatorios.extrator.diretorio", defaultValue = "extrator")
    String diretorioArquivos;

    public Uni<Void> remover() {
        return repository.removerAntigosNativo();
    }

    public Uni<List<ExtratorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ExtratorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ExtratorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Extrator not found"))
                .map(this::toResponse);
    }

    public Uni<ExtratorResponse> create(ExtratorRequest r) {
        var e = new Extrator();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ExtratorResponse> update(Long id, ExtratorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Extrator not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Extrator not found")));
    }

    private void apply(Extrator e, ExtratorRequest r) {
        e.log = r.log();
        e.situacao = r.situacao();
        e.tipo = r.tipo();
        e.sql = r.sql();
        e.usuarioId = r.usuarioId();
        e.tabelaId = r.tabelaId();
        e.dataInicio = r.dataInicio();
        e.dataFim = r.dataFim();
    }

    private ExtratorResponse toResponse(Extrator e) {
        return new ExtratorResponse(e.id, e.log, e.situacao, e.tipo, e.sql, e.usuarioId, e.tabelaId, e.dataInicio, e.dataFim);
    }


    // Reinicia a carga de um extrator: coloca a extracao de volta na fila e limpa log/timestamps
    // (semantica equivalente ao ExtratorService.reiniciaEsse do legado).
    public Uni<ExtratorResponse> reiniciar(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Extrator not found"))
                .invoke(e -> {
                    e.situacao = "Na fila";
                    e.log = null;
                    e.dataFim = null;
                    e.dataInicio = new Date();
                })
                .map(this::toResponse);
    }

    // Disponibiliza o arquivo gerado ({diretorio}/{id}.csv|pdf) da extracao, se existir.
    public Uni<File> arquivo(Long id, String tipo) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Extrator not found"))
                .map(e -> {
                    String ext = "PDF".equalsIgnoreCase(tipo) ? "pdf"
                            : ("EXCEL".equalsIgnoreCase(tipo) || "XLSX".equalsIgnoreCase(tipo)) ? "xlsx" : "csv";
                    File file = Paths.get(diretorioArquivos, id + "." + ext).toFile();
                    if (!file.exists() || !file.isFile()) {
                        throw new NotFoundException("Arquivo " + id + "." + ext + " nao encontrado em " + diretorioArquivos);
                    }
                    return file;
                });
    }

    // Cria uma requisicao de exportacao, envia via Kafka e retorna o Extrator criado.
    public Uni<ExtratorResponse> solicitarExportacao(Long tabelaId, Long usuarioId, String tipo, Map<String, Object> filtros) {
        var e = new Extrator();
        e.tabelaId = tabelaId;
        e.usuarioId = usuarioId;
        e.tipo = tipo;
        e.situacao = "Na fila";
        e.log = "Exportacao solicitada " + new Date();
        e.dataInicio = new Date();
        e.sql = "";
        return repository.persist(e).chain(saved -> {
            ExportRequest request = new ExportRequest(saved.id, tabelaId, usuarioId, tipo, "", filtros);
            return exportProducer.enviar(request).replaceWith(toResponse(saved));
        });
    }

    // Migrado de ExtratorController.carregarextrator (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/ExtratorController.java:183, camada controller)
    // Logica original (adaptar):
    // public String carregarextrator() {
    //         return "/view/relatorios/extrator.xhtml";
    //     }
    public Uni<String> carregarextrator() {
        // Obs: logica de UI do controlador JSF legado (navegacao de tela /view/relatorios/extrator.xhtml), sem equivalente reativo
        return Uni.createFrom().item(null);
    }

}
