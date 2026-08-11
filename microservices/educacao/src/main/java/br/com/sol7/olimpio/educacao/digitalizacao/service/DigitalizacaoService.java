package br.com.sol7.olimpio.educacao.digitalizacao;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import java.util.Date;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class DigitalizacaoService { @Inject DigitalizacaoRepository repository; public Uni<List<DigitalizacaoResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<DigitalizacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<DigitalizacaoResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("Digitalizacao not found")).map(this::toResponse);} public Uni<DigitalizacaoResponse> create(DigitalizacaoRequest r){var e=new Digitalizacao();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<DigitalizacaoResponse> update(Long id,DigitalizacaoRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("Digitalizacao not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("Digitalizacao not found")));} private void apply(Digitalizacao e,DigitalizacaoRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private DigitalizacaoResponse toResponse(Digitalizacao e){return new DigitalizacaoResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de DigitalizacaoController.carregarDiasAula (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/DigitalizacaoController.java:137, camada controller)
    // Logica original (adaptar):
    // public void carregarDiasAula() {
    //         oferecimentoComponenteCurricular = oferecimentoComponenteCurricularService.buscarOferecimentoComDiasAula(oferecimentoComponenteCurricular);
    //         oferecimentoComponenteCurricular = oferecimentoComponenteCurricularService.buscarOcorrenciaComOFerecimento(oferecimentoComponenteCurricular);
    //         digitalizacaoChamadas = digitalizacaoChamadaService.listarArquivosTurma(oferecimentoComponenteCurricular);
    // 
    //         List<ChamadaAssinadaImpressa> chamadaAssinadaImpressas = chamadaAssinadaImpressaService.chamadasAtivasNaoDigitadas(oferecimentoComponenteCurricular);
    //         for (ChamadaAssinadaImpressa ci : chamadaAssinadaImpressas) {
    //             Digitalizacao ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarDiasAula() {
        // Obs: logica de UI do controller JSF (depende de DigitalizacaoChamadaService/ChamadaAssinadaImpressaService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de DigitalizacaoController.carregarDocumentosAluno (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/DigitalizacaoController.java:153, camada controller)
    // Logica original (adaptar):
    // public void carregarDocumentosAluno() {
    //         documentoAlunos = new ArrayList<>(documentoAlunoService.listarDocumentosAluno(pessoa));
    //         documentoAluno = new DocumentoAluno();
    //     }
    public Uni<Void> carregarDocumentosAluno() {
        // Obs: logica de UI do controller JSF (depende do DocumentoAlunoService e Pessoa)
        return Uni.createFrom().voidItem();
    }


    // Migrado de DigitalizacaoController.carregarMatriculas (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/DigitalizacaoController.java:346, camada controller)
    // Logica original (adaptar):
    // public void carregarMatriculas() {
    //         matriculas = matriculaService.matriculasAtivas(oferecimentoComponenteCurricular);
    //         if (!ObjectUtil.nullOrEmpty(matriculas)) {
    //             Collections.sort(matriculas, Matricula::compareToComponente);
    //         }
    //     }
    public Uni<Void> carregarMatriculas() {
        // Obs: logica de UI do controller JSF (depende do MatriculaService.matriculasAtivas)
        return Uni.createFrom().voidItem();
    }


    // Migrado de DigitalizacaoController.carregarOcorrencia (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/DigitalizacaoController.java:353, camada controller)
    // Observacao: parametro digitalizacaoChamadaId: era DigitalizacaoChamada (referencia por id)
    // Logica original (adaptar):
    // public void carregarOcorrencia(DigitalizacaoChamada digitalizacaoChamada) {
    //         this.digitalizacaoChamada = digitalizacaoChamada;
    //         ocorrenciaComponenteCurriculars = ocorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimentoEDatas(digitalizacaoChamada.getChamadaAssinadaImpressa().getOferecimentoComponenteCurricular(), digitalizacaoChamada.getChamadaAssinadaImpressa().getInicio(), digitalizacaoChamada.getChamadaAssinadaImpressa().getFim());
    //         cadernoComponenteCurriculares = cadernoComponenteCurricularService.buscarCadernoChamadaOcorrencias(ocorrenciaComponenteCurriculars);
    //     }
    public Uni<Void> carregarOcorrencia(Long digitalizacaoChamadaId) {
        // Obs: logica de UI do controller JSF (depende de OcorrenciaComponenteCurricularService/CadernoComponenteCurricularService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de DigitalizacaoController.verificarPresenca (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/DigitalizacaoController.java:359, camada controller)
    // Observacao: retorno: era CadernoComponenteCurricular (referencia por id); parametro matriculaId: era Matricula (referencia por id); parametro ocorrenciaComponenteCurricularId: era OcorrenciaComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public CadernoComponenteCurricular verificarPresenca(Matricula matricula, OcorrenciaComponenteCurricular ocorrenciaComponenteCurricular) {
    //         try {
    //             if (ocorrenciaComponenteCurricular.getData().after(new Date())) {
    //                 return new CadernoComponenteCurricular();
    //             }
    //             for (CadernoComponenteCurricular c : cadernoComponenteCurriculares) {
    //                 if (c.getMatricula().equals(matricula) && c.getOcorrenciaComponenteCurricular().equals(ocorrenciaComponenteCurricular)) {
    //                     return c;
    //                 }
    //             }
    //             return new CadernoComponenteCurricular();
    //         } catch (Exception e) {
    // // ... (truncado, ver fonte original)
    public Uni<Long> verificarPresenca(Long matriculaId, Long ocorrenciaComponenteCurricularId) {
        // Obs: logica de UI do controller JSF (depende de CadernoComponenteCurricular/Matricula/OcorrenciaComponenteCurricular)
        return Uni.createFrom().item(null);
    }

}