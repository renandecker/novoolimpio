package br.com.sol7.olimpio.educacao.turma;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import java.math.BigDecimal;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.educacao.shared.notificacao.NotificacaoEventProducer;

@ApplicationScoped
@WithTransaction
public class TurmaService {
    @Inject
    TurmaRepository repository;
    @Inject
    NotificacaoEventProducer notificacaoEventProducer;

    public Uni<List<TurmaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TurmaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<TurmaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Turma not found")).map(this::toResponse);
    }

    public Uni<TurmaResponse> create(TurmaRequest r) {
        var e = new Turma();
        apply(e, r);
        return repository.persist(e)
                .chain(persisted -> notificacaoEventProducer.enviar(null, "PROFESSOR", "ALTERACAO_TURMA",
                        "Turma criada: " + persisted.nome,
                        "A turma '" + persisted.nome + "' foi criada.",
                        "/view/configuracao/notificacoes-professor")
                        .replaceWith(() -> toResponse(persisted)));
    }

    public Uni<TurmaResponse> update(Long id, TurmaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Turma not found")).invoke(e -> apply(e, r))
                .chain(e -> notificacaoEventProducer.enviar(null, "PROFESSOR", "ALTERACAO_TURMA",
                        "Turma alterada: " + e.nome,
                        "A turma '" + e.nome + "' teve status ou dia de aula alterado.",
                        "/view/configuracao/notificacoes-professor")
                        .replaceWith(() -> toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Turma not found")));
    }

    private void apply(Turma e, TurmaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private TurmaResponse toResponse(Turma e) {
        return new TurmaResponse(e.id, e.nome, e.dadosJson);
    }



    // Migrado de TurmaController.gerarDocumentoTrocaTurmaTodos (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:454, camada controller)
    // Observacao: retorno: era StreamedContent no legado
    // Logica original (adaptar):
    // public StreamedContent gerarDocumentoTrocaTurmaTodos() {
    //         try {
    //             contrato = trocaOferecimentoWrappers.get(0).getMatricula().getContrato();
    //             documentoTrocaTurmas = new ArrayList<>();
    //             for (TrocaOferecimentoWrapper troca : trocaOferecimentoWrappers) {
    //                 if (troca.getNewOferecimentoComponenteCurricular() != null) {
    //                     confirmaTrocaAluno(troca.getMatricula(), troca.getNewOferecimentoComponenteCurricular());
    //                 }
    //             }
    //             contrato.setTrocaTurma(true);
    //             contratoService.save(contrato);
    // 
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarDocumentoTrocaTurmaTodos() {
        // Obs: geracao de PDF/documento (depende do microservico financeiro/comercial: contratoService) e do estado da tela (trocaOferecimentoWrappers)
        return Uni.createFrom().item(null);
    }


    // Migrado de TurmaController.gerarDocumentoTrocaTurma (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:487, camada controller)
    // Observacao: retorno: era StreamedContent no legado
    // Logica original (adaptar):
    // public StreamedContent gerarDocumentoTrocaTurma() {
    //         try {
    // 
    //             documentoTrocaTurmas = new ArrayList<>();
    //             confirmaTrocaAluno(matricula, oferecimentoComponenteCurricular);
    // 
    //             List<Matricula> matriculas = matriculaService.buscarMatriculasComCadernoPorContrato(contrato);
    // 
    //             cadernoComponenteCurricularService.atualizaChamadaFrequente(matriculas);
    // 
    //             contratoService.atulizaInicioeFimOferecimentoUltimoCadernoPorPorContrato(contrato);
    // 
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarDocumentoTrocaTurma() {
        // Obs: geracao de PDF/documento (depende do microservico financeiro/comercial: contratoService) e do estado da tela
        return Uni.createFrom().item(null);
    }








}
