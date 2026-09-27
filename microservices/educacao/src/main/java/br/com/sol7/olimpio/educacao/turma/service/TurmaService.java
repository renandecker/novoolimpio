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

    // Migrado de TurmaController.carregarInformacoes (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:187, camada controller)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public void carregarInformacoes(OferecimentoComponenteCurricular oferecimentoComponenteCurricular) {
    //         this.oferecimentoComponenteCurricular = oferecimentoComponenteCurricular;
    //         this.oferecimentoComponenteCurricular = oferecimentoComponenteCurricularService.buscarOcorrenciaComOFerecimento(oferecimentoComponenteCurricular);
    //         matriculas = matriculaService.matriculasAtivas(oferecimentoComponenteCurricular);
    //         if (!ObjectUtil.nullOrEmpty(matriculas)) {
    //             Collections.sort(matriculas);
    //         }
    //     }
    public Uni<Void> carregarInformacoes(Long oferecimentoComponenteCurricularId) {
        // Obs: depende do microservico matricula (matriculaService.matriculasAtivas) e do oferecimentoComponenteCurricularService
        return Uni.createFrom().voidItem();
    }


    // Migrado de TurmaController.verificarAprovacao (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:250, camada controller)
    // Logica original (adaptar):
    // private void verificarAprovacao() {
    //         for (Matricula matricula : matriculas) {
    //             List<Integer> list = cadernoComponenteCurricularService.buscarCadernoChamadaPendenteComContrato(matricula.getContrato());
    //             if (!ObjectUtil.nullOrEmpty(list)) {
    //                 matricula.setStatus(StatusMatricula.PENDENTE);
    //             } else {
    //                 try {
    //                     if ((new BigDecimal(cadernoChamadaController.mediaFinal(matricula)).floatValue() >= oferecimentoComponenteCurricular.getCurriculo().getGrau().getMediaFinal().floatValue()) && cadernoChamadaController.possuiFrequenciaMinima(matricula)) {
    //                         matricula.setStatus(StatusMatricula.APROVADO) ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> verificarAprovacao() {
        // Obs: depende do microservico matricula (cadernoComponenteCurricularService/cadernoChamadaController: mediaFinal, possuiFrequenciaMinima) e do estado da tela (matriculas)
        return Uni.createFrom().voidItem();
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


    // Migrado de TurmaController.buscarCriterios (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:784, camada controller)
    // Logica original (adaptar):
    // public void buscarCriterios() {
    //         List<Criterio> criterios = criterioService.buscarCriterio(oferecimentoComponenteCurricular.getCurriculo(), oferecimentoComponenteCurricular.getUnidade());
    //         criterio = null;
    //         if (!ObjectUtil.nullOrEmpty(criterios)) {
    //             criterio = criterios.get(0);
    //             if (criterios.size() > 1) {
    //                 criterioService.corrigeCriterioDuplicadoPorunidadeCurso(criterio);
    //             }
    //         }
    //         if (criterio != null) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Critérios não foram aplicados!");
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarCriterios() {
        // Obs: depende do estado da tela (oferecimentoComponenteCurricular) e do criterioService/corrigeCriterioDuplicadoPorunidadeCurso
        return Uni.createFrom().voidItem();
    }


    // Migrado de TurmaController.gerarAula (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:799, camada controller)
    // Logica original (adaptar):
    // private void gerarAula() {
    //         try {
    //             Calendar calendario = Calendar.getInstance();
    //             calendario.setTime(dataInicial);
    //             novaOcorrenciaComponenteCurriculars = new ArrayList<>();
    //             if (ObjectUtil.nullOrEmpty(diasAulaSelecionado)) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Marque pelo menos um Dia da Semana.");
    //                 return;
    //             }
    //             int caluloDia = 1;
    //             while (caluloDia <= oferecimentoComponenteCurricular.getOcorrenciaComponenteCurriculares().size()) {
    //                 ocorrenciaComponenteCurricular = new OcorrenciaComponenteCurricular();
    // // ... (truncado, ver fonte original)
    public Uni<Void> gerarAula() {
        // Obs: logica de UI do controller JSF (geracao de ocorrencias de aula); sem logica de dados portaavel isolada
        return Uni.createFrom().voidItem();
    }


    // Migrado de TurmaController.carregarTodasTurmas (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:990, camada controller)
    // Observacao: parametro contratoId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public void carregarTodasTurmas(Contrato contrato) {
    //         List<Matricula> matriculas = matriculaService.buscarMatriculasPorContrato(contrato);
    //         this.contrato = contrato;
    //         trocaturma = false;
    //         trocaOferecimentoWrappers = new ArrayList<>();
    //         for (Matricula mm : matriculas) {
    //             TrocaOferecimentoWrapper trocaOferecimentoWrapper = new TrocaOferecimentoWrapper();
    //             trocaOferecimentoWrapper.setMatricula(mm);
    //             FilterOferecimentoTrocaTurma filterOferecimentoTrocaTurma = new FilterOferecimentoTrocaTurma(mm.getOferecimentoComponenteCurricular().getComponenteCurricular(), usuarioLogadoController.getUnidadesDisponiveis(), mm.getOferecimentoCom ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarTodasTurmas(Long contratoId) {
        // Obs: depende do microservico matricula (matriculaService.buscarMatriculasPorContrato) e do estado da tela
        return Uni.createFrom().voidItem();
    }


    // Migrado de TurmaController.carregarTurmasDisponiveis (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:1005, camada controller)
    // Observacao: parametro matriculaId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public void carregarTurmasDisponiveis(Matricula matricula) {
    //         this.matricula = matricula;
    //         this.contrato = matricula.getContrato();
    //         oferecimentoComponenteCurricular = null;
    //         FilterOferecimentoTrocaTurma filterOferecimentoTrocaTurma = new FilterOferecimentoTrocaTurma(matricula.getOferecimentoComponenteCurricular().getComponenteCurricular(), usuarioLogadoController.getUnidadesDisponiveis(), matricula.getOferecimentoComponenteCurricular());
    //         turmasOferecidas = new BaseLazyModelJPASpecific<OferecimentoComponenteCurricular>(oferecimentoComponenteCurricularService.getOferecimentoComponenteCurricularRepository(), filterOferecimentoTrocaTurma);
    //     }
    public Uni<Void> carregarTurmasDisponiveis(Long matriculaId) {
        // Obs: logica de UI (lazy data model de oferecimentoComponenteCurricular); depende do microservico matricula e de unidades disponiveis do usuario logado
        return Uni.createFrom().voidItem();
    }


    // Migrado de TurmaController.carregarComponentesDisponiveis (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:1013, camada controller)
    // Observacao: parametro matriculaId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public void carregarComponentesDisponiveis(Matricula matricula) {
    //         this.matricula = matricula;
    //         this.contrato = matricula.getContrato();
    //         oferecimentoComponenteCurricular = null;
    //         FilterOferecimentoTrocaComponente filterOferecimentoTrocaTurma = new FilterOferecimentoTrocaComponente(matricula.getOferecimentoComponenteCurricular().getComponenteCurricular(), matricula.getOferecimentoComponenteCurricular().getCurriculo(), usuarioLogadoController.getUnidadesDisponiveis());
    //         turmasOferecidas = new BaseLazyModelJPASpecific<OferecimentoComponenteCurricular>(oferecimentoComponenteCurricularService.getOferecimentoComponenteCurricularRepository(), filterOferecimentoTr ...
    public Uni<Void> carregarComponentesDisponiveis(Long matriculaId) {
        // Obs: logica de UI (lazy data model de oferecimentoComponenteCurricular); depende do microservico matricula e de unidades disponiveis do usuario logado
        return Uni.createFrom().voidItem();
    }


    // Migrado de TurmaController.carregarTrocarTurmaMatricula (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:1021, camada controller)
    // Observacao: parametro matriculaId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public void carregarTrocarTurmaMatricula(Matricula matricula) {
    //         FilterTrocaTurmaComMatricula filterTrocaTurmaComContrato = new FilterTrocaTurmaComMatricula(matricula);
    //         trocaTurmaLazyDataModel = new BaseLazyModelJPASpecific<TrocaTurma>(trocaTurmaService.getTrocaTurmaRepository(), filterTrocaTurmaComContrato);
    //     }
    public Uni<Void> carregarTrocarTurmaMatricula(Long matriculaId) {
        // Obs: logica de UI (lazy data model de trocaTurma); depende do microservico matricula
        return Uni.createFrom().voidItem();
    }


    // Migrado de TurmaController.carregarTrocarTurmaContrato (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurmaController.java:1026, camada controller)
    // Observacao: parametro contratoId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public void carregarTrocarTurmaContrato(Contrato contrato) {
    //         FilterTrocaTurmaComContrato filterTrocaTurmaComContrato = new FilterTrocaTurmaComContrato(contrato);
    //         trocaTurmaLazyDataModel = new BaseLazyModelJPASpecific<TrocaTurma>(trocaTurmaService.getTrocaTurmaRepository(), filterTrocaTurmaComContrato);
    //     }
    public Uni<Void> carregarTrocarTurmaContrato(Long contratoId) {
        // Obs: logica de UI (lazy data model de trocaTurma); depende do microservico financeiro/comercial (contrato)
        return Uni.createFrom().voidItem();
    }

}
