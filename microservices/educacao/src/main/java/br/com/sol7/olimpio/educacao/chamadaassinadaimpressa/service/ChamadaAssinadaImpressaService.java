package br.com.sol7.olimpio.educacao.chamadaassinadaimpressa;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;

import br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular.OcorrenciaComponenteCurricularResponse;
import br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular.OcorrenciaComponenteCurricularService;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularService;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ChamadaAssinadaImpressaService {

    @Inject ChamadaAssinadaImpressaRepository repository;
    @Inject OcorrenciaComponenteCurricularService ocorrenciaComponenteCurricularService;
    @Inject OferecimentoComponenteCurricularService oferecimentoComponenteCurricularService;

    // TODO: portar ChamadaAssinadaImpressaService.carregarChamadasPendentes() (legado) - gera e imprime chamadas assinadas pendentes (normais e corrigidas). Logica de geracao de PDF/impressao nao portada automaticamente, ver RELATORIO_SCHEDULE.md.
    public Uni<Void> carregarChamadasPendentesAutomatico() {
        // Obs: geracao de PDF/impressao (ver RELATORIO_SCHEDULE.md) e logica de agendamento nao porta sem o scheduler
        return Uni.createFrom().voidItem();
    }

    public Uni<List<ChamadaAssinadaImpressaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ChamadaAssinadaImpressaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ChamadaAssinadaImpressaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ChamadaAssinadaImpressa not found"))
                .map(this::toResponse);
    }

    public Uni<ChamadaAssinadaImpressaResponse> create(ChamadaAssinadaImpressaRequest r) {
        var e = new ChamadaAssinadaImpressa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ChamadaAssinadaImpressaResponse> update(Long id, ChamadaAssinadaImpressaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ChamadaAssinadaImpressa not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ChamadaAssinadaImpressa not found")));
    }

    private void apply(ChamadaAssinadaImpressa e, ChamadaAssinadaImpressaRequest r) { e.data = r.data(); e.oferecimentoComponenteCurricularId = r.oferecimentoComponenteCurricularId(); e.sequencia = r.sequencia(); e.quantidade = r.quantidade(); e.aulaCoringa = r.aulaCoringa(); e.ativo = r.ativo(); e.inicio = r.inicio(); e.fim = r.fim(); e.pendente = r.pendente(); }

    private ChamadaAssinadaImpressaResponse toResponse(ChamadaAssinadaImpressa e) {
        return new ChamadaAssinadaImpressaResponse(e.id, e.data, e.oferecimentoComponenteCurricularId, e.sequencia, e.quantidade, e.aulaCoringa, e.ativo, e.inicio, e.fim, e.pendente);
    }


    // Migrado de ChamadaAssinadaImpressaController.buscarOcorrencias (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ChamadaAssinadaImpressaController.java:83, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarOcorrencias(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             ChamadaAssinadaImpressa chamadaAssinadaImpressa = (ChamadaAssinadaImpressa) event.getData();
    //             ocorrenciaComponenteCurriculars = ocorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimentoEDatas(chamadaAssinadaImpressa.getOferecimentoComponenteCurricular(), chamadaAssinadaImpressa.getInicio(), chamadaAssinadaImpressa.getFim());
    //         }
    //     }
    public Uni<Void> buscarOcorrencias(String event) {
        // Obs: logica de UI (ToggleEvent) e depende do microservico matricula (ocorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimentoEDatas)
        return Uni.createFrom().voidItem();
    }


    // Migrado de ChamadaAssinadaImpressaController.carregarNovaChamada (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ChamadaAssinadaImpressaController.java:90, camada controller)
    // Logica original (adaptar):
    // public void carregarNovaChamada() {
    //         oferecimentoComponenteCurricular = new OferecimentoComponenteCurricular();
    //     }
    public Uni<Void> carregarNovaChamada() {
        // Obs: logica de UI (instancia novo oferecimentoComponenteCurricular na tela)
        return Uni.createFrom().voidItem();
    }


    // Migrado de ChamadaAssinadaImpressaController.autoCompleteOferecimento (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ChamadaAssinadaImpressaController.java:130, camada controller)
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> autoCompleteOferecimento(String query) {
    //         return oferecimentoComponenteCurricularService.autoCompleteComUnidadeChamadaAssinada(query, usuarioLogadoController.getUnidadesDisponiveis());
    //     }
    public Uni<List<Long>> autoCompleteOferecimento(String query) {
        // Obs: depende do oferecimentoComponenteCurricularService (autoCompleteComUnidadeChamadaAssinada) e de unidades disponiveis do usuario logado
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de ChamadaAssinadaImpressaController.gerarChamadaAssinadaRetrato (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ChamadaAssinadaImpressaController.java:135, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era ChamadaAssinadaImpressa (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarChamadaAssinadaRetrato(ChamadaAssinadaImpressa cc) throws MalformedURLException {
    //         hibernateService.executeUpdateSQL(" insert into edc_chamada_assinada_impressa_download (data_download,qtde , id_usuario, id_chamada_assinada_impressa) " +
    //                 " values (now(),1," + usuarioLogadoController.getUsuario().getId() + ", " + cc.getId() + ") on conflict on constraint uk_edc_chamada_assinada_impressa_download DO UPDATE " +
    //                 " SET  qtde = edc_chamada_assinada_impressa_download.qtde + 1 ");
    // 
    //         chamadaAssinadaImpressa = cc;
    //         chamadaAssinadaImpressa.setPendente(false);
    //         chamadaAssinadaImpressa.setQuantidade(chamadaAssinadaImp ...
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarChamadaAssinadaRetrato(Long ccId) {
        // Obs: geracao de PDF/impressao (era StreamedContent no legado) e update em edc_chamada_assinada_impressa_download; nao portado
        return Uni.createFrom().item(null);
    }


    // Migrado de ChamadaAssinadaImpressaController.gerarChamadaAssinadaPaisagem (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ChamadaAssinadaImpressaController.java:155, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era ChamadaAssinadaImpressa (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarChamadaAssinadaPaisagem(ChamadaAssinadaImpressa cc) throws MalformedURLException {
    //         hibernateService.executeUpdateSQL(" insert into edc_chamada_assinada_impressa_download (data_download,qtde , id_usuario, id_chamada_assinada_impressa) " +
    //                 " values (now(),1," + usuarioLogadoController.getUsuario().getId() + ", " + cc.getId() + ") on conflict on constraint uk_edc_chamada_assinada_impressa_download DO UPDATE " +
    //                 " SET  qtde = edc_chamada_assinada_impressa_download.qtde + 1 ");
    // 
    //         chamadaAssinadaImpressa = cc;
    //         chamadaAssinadaImpressa.setPendente(false);
    //         chamadaAssinadaImpressa.setQuantidade(chamadaAssinadaIm ...
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarChamadaAssinadaPaisagem(Long ccId) {
        // Obs: geracao de PDF/impressao (era StreamedContent no legado) e update em edc_chamada_assinada_impressa_download; nao portado
        return Uni.createFrom().item(null);
    }


    // Migrado de ChamadaAssinadaImpressaService.carregarChamadasPendentes (src/main/java/br/com/sol7/olimpio/service/services/educacao/ChamadaAssinadaImpressaService.java:56, camada service)
    // Logica original (adaptar):
    // public void carregarChamadasPendentes() {
    //         System.out.println("chamadas assinadas pendentes inicio " + DateUtil.getDateAsFormattedText(new Date()) + " " + DateUtil.getHourMinAsFormattedString(new Date()));
    // 
    //         List<Integer> oferecimentoComponenteCurriculars = (List<Integer>) hibernateService.executeSQL("select o.id from edc_oferecimento_componente_curricular o where " +
    //                 " not exists(select ch from edc_chamada_assinada_impressa ch where ch.id_oferecimento_componente_curricular = o.id) and (o.status = 'LIBERADA' or o.status = 'EM_ANDAMENTO')");
    //         if (!ObjectUtil.nullOrEmpty(oferecimentoComponenteCurriculars)) {
    //             for (Integer ii : oferecimentoCompone ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarChamadasPendentes() {
        // Obs: geracao de chamadas (edc_oferecimento_componente_curricular) e impressao de PDF; logica de geracao nao portada automaticamente (ver RELATORIO_SCHEDULE.md)
        return Uni.createFrom().voidItem();
    }


    // Migrado de ChamadaAssinadaImpressaService.carregarChamadasNovas (src/main/java/br/com/sol7/olimpio/service/services/educacao/ChamadaAssinadaImpressaService.java:77, camada service)
    // Observacao: parametro oId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public void carregarChamadasNovas(OferecimentoComponenteCurricular o) {
    //         if (!ObjectUtil.nullOrEmpty(o)) {
    //             List<ChamadaAssinadaImpressa> chamadasAtivas = chamadasAtivas(o);
    //             if (!ObjectUtil.nullOrEmpty(chamadasAtivas)) {
    //                 for (ChamadaAssinadaImpressa chamadaAssinadaImpressa : chamadasAtivas) {
    //                     chamadaAssinadaImpressa.setAtivo(false);
    //                 }
    //                 getChamadaAssinadaImpressaRepository().saveAll(chamadasAtivas);
    //             }
    // 
    //             if (o.getQtdeSequencia() > 0) {
    //                 List<ChamadaAssinadaImpressa> ultimachamadaAssinadaImpressas = getChamadaAssinadaImpressaRepository().verificaUltimaBaixada(o, ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarChamadasNovas(Long oId) {
        // Obs: logica de geracao de chamadas assinadas (verificaUltimaBaixada, qtdeSequencia) dependente do oferecimentoComponenteCurricularService; nao portada
        return Uni.createFrom().voidItem();
    }


    // Migrado de ChamadaAssinadaImpressaService.carregarChamadasCorringa (src/main/java/br/com/sol7/olimpio/service/services/educacao/ChamadaAssinadaImpressaService.java:103, camada service)
    // Observacao: parametro oId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public void carregarChamadasCorringa(OferecimentoComponenteCurricular o) {
    //         List<OcorrenciaComponenteCurricular> aulasextras = ocorrenciaComponenteCurricularService.buscarOcorrenciaExtras(o);
    //         if (!ObjectUtil.nullOrEmpty(o) && !ObjectUtil.nullOrEmpty(aulasextras)) {
    //             carregarChamadas(o, aulasextras, maiorSequencia(o), true);
    //         }
    //     }
    public Uni<Void> carregarChamadasCorringa(Long oId) {
        if (oId == null) return Uni.createFrom().voidItem();
        return ocorrenciaComponenteCurricularService.buscarOcorrenciaExtras(oId)
                .chain(extras -> {
                    if (extras == null || extras.isEmpty()) return Uni.createFrom().voidItem();
                    return repository.maiorSequencia(oId)
                            .map(seqList -> seqList == null || seqList.isEmpty() || seqList.get(0) == null
                                    ? 0 : ((Number) seqList.get(0)).intValue())
                            .chain(maior -> carregarChamadas(oId, extras, maior, true));
                });
    }


    // Migrado de ChamadaAssinadaImpressaService.carregarChamadasNormais (src/main/java/br/com/sol7/olimpio/service/services/educacao/ChamadaAssinadaImpressaService.java:110, camada service)
    // Observacao: parametro oId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public void carregarChamadasNormais(OferecimentoComponenteCurricular o, int chamadas) {
    //         if (!ObjectUtil.nullOrEmpty(o)) {
    //             List<OcorrenciaComponenteCurricular> aulasNormais = ocorrenciaComponenteCurricularService.buscarOcorrenciaNormais(o);
    //             if (!ObjectUtil.nullOrEmpty(o) && !ObjectUtil.nullOrEmpty(aulasNormais)) {
    //                 carregarChamadas(o, aulasNormais,  chamadas, false);
    //             }
    //         }
    //     }
    public Uni<Void> carregarChamadasNormais(Long oId, Integer chamadas) {
        if (oId == null) return Uni.createFrom().voidItem();
        return ocorrenciaComponenteCurricularService.buscarOcorrenciaNormais(oId)
                .chain(normais -> {
                    if (normais == null || normais.isEmpty()) return Uni.createFrom().voidItem();
                    return carregarChamadas(oId, normais, chamadas == null ? 0 : chamadas, false);
                });
    }


    // Migrado de ChamadaAssinadaImpressaService.carregarChamadas (src/main/java/br/com/sol7/olimpio/service/services/educacao/ChamadaAssinadaImpressaService.java:119, camada service)
    // Observacao: parametro oId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public void carregarChamadas(OferecimentoComponenteCurricular o, List<OcorrenciaComponenteCurricular> ocorrenciaComponenteCurriculars, int chamadas, Boolean coringa) {
    //         if (!ObjectUtil.nullOrEmpty(o)) {
    //             List<ChamadaAssinadaImpressa> chamadaAssinadaImpressasPendenteTemp = new ArrayList<>();
    //             ChamadaAssinadaImpressa chamadaAssinadaImpressaTemp = new ChamadaAssinadaImpressa();
    // 
    //             if (!ObjectUtil.nullOrEmpty(o)) {
    //                 Collections.sort(ocorrenciaComponenteCurriculars);
    //                 if (!ObjectUtil.nullOrEmpty(ocorrenciaComponenteCurriculars) && o.getQtdeSequencia() > 0) {
    //                     int controlechamada = chamadas + 1;
    // 
    //                ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarChamadas(Long oId, List<Long> ocorrenciaComponenteCurriculars, Integer chamadas, Boolean coringa) {
        if (oId == null) return Uni.createFrom().voidItem();
        return oferecimentoComponenteCurricularService.find(oId).chain(o -> {
            if (o == null || o.qtdeSequencia() <= 0 || ocorrenciaComponenteCurriculars == null || ocorrenciaComponenteCurriculars.isEmpty()) {
                return Uni.createFrom().voidItem();
            }
            return buscarOcorrenciasPorIds(ocorrenciaComponenteCurriculars).chain(ocorrencias -> {
                if (ocorrencias.isEmpty()) return Uni.createFrom().voidItem();
                int qtde = o.qtdeSequencia();
                int size = ocorrencias.size();
                int controlechamada = (chamadas == null ? 0 : chamadas) + 1;
                int dividido = size / qtde;
                int resto = size % qtde;
                if (resto > 0) dividido = dividido + 1;
                List<ChamadaAssinadaImpressa> candidatas = new ArrayList<>();
                for (int limite = 0; dividido > limite; limite++) {
                    ChamadaAssinadaImpressa temp = new ChamadaAssinadaImpressa();
                    temp.sequencia = controlechamada;
                    temp.data = new Date();
                    temp.pendente = true;
                    temp.aulaCoringa = Boolean.TRUE.equals(coringa);
                    temp.oferecimentoComponenteCurricularId = oId;
                    if (controlechamada == 1) {
                        temp.inicio = ocorrencias.get(0).data();
                        if (size < qtde) {
                            temp.fim = ocorrencias.get(size - 1).data();
                        } else {
                            temp.fim = ocorrencias.get(qtde - 1).data();
                        }
                    } else {
                        if (size >= (qtde * limite)) {
                            temp.inicio = ocorrencias.get(qtde * limite).data();
                            if (size <= (qtde * (limite + 1))) {
                                temp.fim = ocorrencias.get(size - 1).data();
                            } else {
                                temp.fim = ocorrencias.get((qtde * (limite + 1)) - 1).data();
                            }
                        } else {
                            temp.inicio = ocorrencias.get(size - 1).data();
                            temp.fim = ocorrencias.get(size - 1).data();
                        }
                    }
                    candidatas.add(temp);
                    controlechamada++;
                }
                // Obs: criacao de DigitalizacaoChamada nao portada (entidade inexistente neste microsservico)
                Uni<List<ChamadaAssinadaImpressa>> uni = Uni.createFrom().item(new ArrayList<>());
                for (ChamadaAssinadaImpressa c : candidatas) {
                    uni = uni.chain(acc -> repository.verificaPossuiPendentes(oId, c.sequencia)
                            .map(count -> {
                                Object value = (count == null || count.isEmpty()) ? null : count.get(0);
                                boolean possuiPendente = value != null && ((Number) value).longValue() > 0;
                                if (!possuiPendente) acc.add(c);
                                return acc;
                            }));
                }
                return uni.chain(acc -> acc.isEmpty() ? Uni.createFrom().voidItem() : repository.persist(acc));
            });
        });
    }

    private Uni<List<OcorrenciaComponenteCurricularResponse>> buscarOcorrenciasPorIds(List<Long> ids) {
        Uni<List<OcorrenciaComponenteCurricularResponse>> uni = Uni.createFrom().item(new ArrayList<>());
        for (Long id : ids) {
            uni = uni.chain(list -> ocorrenciaComponenteCurricularService.find(id).map(occ -> {
                list.add(occ);
                return list;
            }));
        }
        return uni.map(list -> {
            list.sort(Comparator.comparing(OcorrenciaComponenteCurricularResponse::data));
            return list;
        });
    }

}

