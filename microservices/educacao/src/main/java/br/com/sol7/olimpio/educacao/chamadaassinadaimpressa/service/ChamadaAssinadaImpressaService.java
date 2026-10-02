package br.com.sol7.olimpio.educacao.chamadaassinadaimpressa;

import br.com.sol7.olimpio.educacao.chamadaassinadaimpressa.util.JasperReportUtil;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularResponse;
import br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular.OcorrenciaComponenteCurricularResponse;
import br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular.OcorrenciaComponenteCurricularService;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularService;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.reactive.ReactiveMailer;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@ApplicationScoped
@WithTransaction
public class ChamadaAssinadaImpressaService {

    private static final Logger LOG = Logger.getLogger(ChamadaAssinadaImpressaService.class);

    @Inject
    ChamadaAssinadaImpressaRepository repository;
    @Inject
    OcorrenciaComponenteCurricularService ocorrenciaComponenteCurricularService;
    @Inject
    OferecimentoComponenteCurricularService oferecimentoComponenteCurricularService;

    @Inject
    ReactiveMailer mailer;

    @ConfigProperty(name = "educacao.email.enabled", defaultValue = "true")
    boolean emailEnabled;

    @ConfigProperty(name = "educacao.email.from", defaultValue = "noreply@olimpio.local")
    String emailFrom;

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

    private void apply(ChamadaAssinadaImpressa e, ChamadaAssinadaImpressaRequest r) {
        e.data = r.data();
        e.oferecimentoComponenteCurricularId = r.oferecimentoComponenteCurricularId();
        e.sequencia = r.sequencia();
        e.quantidade = r.quantidade();
        e.aulaCoringa = r.aulaCoringa();
        e.ativo = r.ativo();
        e.inicio = r.inicio();
        e.fim = r.fim();
        e.pendente = r.pendente();
    }

    private ChamadaAssinadaImpressaResponse toResponse(ChamadaAssinadaImpressa e) {
        return new ChamadaAssinadaImpressaResponse(e.id, e.data, e.oferecimentoComponenteCurricularId, e.sequencia, e.quantidade, e.aulaCoringa, e.ativo, e.inicio, e.fim, e.pendente);
    }

    public Uni<List<OcorrenciaComponenteCurricularResponse>> buscarOcorrencias(Long chamadaId) {
        return repository.findById(chamadaId).onItem().ifNull()
                .failWith(() -> new NotFoundException("ChamadaAssinadaImpressa not found"))
                .chain(chamada -> ocorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimentoEDatas(
                        chamada.oferecimentoComponenteCurricularId,
                        chamada.inicio.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate(),
                        chamada.fim.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate()))
                .chain(ids -> {
                    if (ids == null || ids.isEmpty()) {
                        return Uni.createFrom().item(List.of());
                    }
                    Uni<List<OcorrenciaComponenteCurricularResponse>> uni = Uni.createFrom().item(new ArrayList<>());
                    for (Long id : ids) {
                        uni = uni.chain(list -> ocorrenciaComponenteCurricularService.find(id).map(occ -> {
                            list.add(occ);
                            return list;
                        }));
                    }
                    return uni;
                });
    }


    // Migrado de ChamadaAssinadaImpressaController.carregarNovaChamada (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ChamadaAssinadaImpressaController.java:90, camada controller)
    // Logica original (adaptar):
    // public void carregarNovaChamada() {
    //         oferecimentoComponenteCurricular = new OferecimentoComponenteCurricular();
    //     }



    // Migrado de ChamadaAssinadaImpressaController.autoCompleteOferecimento (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ChamadaAssinadaImpressaController.java:130, camada controller)
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> autoCompleteOferecimento(String query) {
    //         return oferecimentoComponenteCurricularService.autoCompleteComUnidadeChamadaAssinada(query, usuarioLogadoController.getUnidadesDisponiveis());
    //     }
    public Uni<List<Long>> autoCompleteOferecimento(String query) {
        // Obs: depende do oferecimentoComponenteCurricularService (autoCompleteComUnidadeChamadaAssinada) e de unidades disponiveis do usuario logado
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<String> gerarChamadaAssinadaRetrato(Long ccId, Long usuarioId) {
        return repository.findById(ccId)
                .onItem().ifNull().failWith(() -> new NotFoundException("ChamadaAssinadaImpressa not found: " + ccId))
                .chain(chamada -> {
                    return oferecimentoComponenteCurricularService.find(chamada.oferecimentoComponenteCurricularId)
                            .onItem().ifNull().failWith(() -> new NotFoundException("OferecimentoComponenteCurricular not found: " + chamada.oferecimentoComponenteCurricularId))
                            .chain(oferecimento -> gerarPdfChamadaAssinada(chamada, oferecimento, "novaChamaAssinadaRetrato.jasper", usuarioId));
                });
    }

    public Uni<String> gerarChamadaAssinadaPaisagem(Long ccId, Long usuarioId) {
        return repository.findById(ccId)
                .onItem().ifNull().failWith(() -> new NotFoundException("ChamadaAssinadaImpressa not found: " + ccId))
                .chain(chamada -> {
                    return oferecimentoComponenteCurricularService.find(chamada.oferecimentoComponenteCurricularId)
                            .onItem().ifNull().failWith(() -> new NotFoundException("OferecimentoComponenteCurricular not found: " + chamada.oferecimentoComponenteCurricularId))
                            .chain(oferecimento -> gerarPdfChamadaAssinada(chamada, oferecimento, "novaChamaAssinadaPaisagem.jasper", usuarioId));
                });
    }

    private Uni<String> gerarPdfChamadaAssinada(ChamadaAssinadaImpressa chamada, OferecimentoComponenteCurricularResponse oferecimento, String reportName, Long usuarioId) {
        return Uni.createFrom().item(() -> {
            try {
                Map<String, Object> parameters = new HashMap<>();
                parameters.put("CHAMADA_ID", chamada.id);
                parameters.put("OFERECIMENTO_ID", oferecimento.id());
                parameters.put("COMPONENTE_CURRICULAR", oferecimento.componenteCurricular_descricao());
                parameters.put("PROFESSOR", oferecimento.professor_descricao());
                parameters.put("GRUPO", oferecimento.grupo_descricao());
                parameters.put("SALA", oferecimento.sala_descricao());
                parameters.put("DATA_INICIO", chamada.inicio);
                parameters.put("DATA_FIM", chamada.fim);
                parameters.put("SEQUENCIA", chamada.sequencia);

                List<Object> dataSource = List.of(new ChamadaAssinadaReportData(chamada, oferecimento));

                byte[] pdfBytes = gerarRelatorioPdf("/relatorios/" + reportName, parameters, dataSource);

                String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
                String fileName = "chamada_assinada_" + reportName.replace(".jasper", "") + "_" + chamada.id + ".pdf";

                registrarDownload(chamada.id, usuarioId);
                chamada.pendente = false;
                chamada.quantidade = (chamada.quantidade == null ? 0 : chamada.quantidade) + 1;
                Panache.getSession().chain(s -> s.merge(chamada)).subscribe().with(v -> {});

                return base64Pdf;
            } catch (Exception e) {
                LOG.errorf(e, "Erro ao gerar PDF da chamada assinada %d", chamada.id);
                throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage(), e);
            }
        });
    }

    private void registrarDownload(Long chamadaId, Long usuarioId) {
        String sql = """
            INSERT INTO edc_chamada_assinada_impressa_download (data_download, qtde, id_usuario, id_chamada_assinada_impressa)
            VALUES (NOW(), 1, ?, ?)
            ON CONFLICT ON CONSTRAINT uk_edc_chamada_assinada_impressa_download DO UPDATE
            SET qtde = edc_chamada_assinada_impressa_download.qtde + 1, data_download = NOW()
            """;
        Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, usuarioId)
                        .setParameter(2, chamadaId)
                        .executeUpdate())
                .subscribe().with(v -> LOG.infof("Download registrado: chamada=%d, usuario=%d", chamadaId, usuarioId));
    }

    public record ChamadaAssinadaReportData(
            Long chamadaId,
            Integer sequencia,
            Date inicio,
            Date fim,
            Integer quantidade,
            Boolean aulaCoringa,
            String componenteCurricular,
            String professor,
            String grupo,
            String sala
    ) {
        public ChamadaAssinadaReportData(ChamadaAssinadaImpressa chamada, OferecimentoComponenteCurricularResponse oferecimento) {
            this(chamada.id, chamada.sequencia, chamada.inicio, chamada.fim, chamada.quantidade, chamada.aulaCoringa,
                    oferecimento.componenteCurricular_descricao(), oferecimento.professor_descricao(),
                    oferecimento.grupo_descricao(), oferecimento.sala_descricao());
        }
    }

    private byte[] gerarRelatorioPdf(String reportPath, Map<String, Object> parameters, List<?> dataSource) {
        try (InputStream reportStream = getClass().getResourceAsStream(reportPath)) {
            if (reportStream == null) {
                throw new RuntimeException("Relatório não encontrado: " + reportPath);
            }

            JRBeanCollectionDataSource jrDataSource = new JRBeanCollectionDataSource(dataSource);
            Map<String, Object> params = new HashMap<>(parameters);
            params.put("REPORT_DATA_SOURCE", jrDataSource);

            JasperPrint jasperPrint = JasperFillManager.fillReport(reportStream, params, jrDataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do relatório: " + e.getMessage(), e);
        }
    }

    public Uni<Void> carregarChamadasPendentes() {
        String sql = """
            SELECT o.id FROM edc_oferecimento_componente_curricular o
            WHERE NOT EXISTS (
                SELECT 1 FROM edc_chamada_assinada_impressa ch WHERE ch.id_oferecimento_componente_curricular = o.id
            ) AND (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO')
            """;

        return Panache.getSession()
                .chain(s -> s.createNativeQuery(sql).getResultList())
                .map(rows -> rows.stream().map(r -> ((Number) r).longValue()).toList())
                .chain(oferecimentoIds -> {
                    if (oferecimentoIds.isEmpty()) {
                        LOG.info("Nenhum oferecimento sem chamada assinada pendente encontrado");
                        return Uni.createFrom().voidItem();
                    }
                    LOG.infof("Encontrados %d oferecimentos sem chamada assinada, gerando chamadas...", oferecimentoIds.size());

                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (Long oferecimentoId : oferecimentoIds) {
                        final Long id = oferecimentoId;
                        chain = chain.chain(v -> carregarChamadasNovas(id));
                    }
                    return chain;
                });
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

    public Uni<Void> carregarChamadasNormais(Long oId, Integer chamadas) {
        if (oId == null) return Uni.createFrom().voidItem();
        return ocorrenciaComponenteCurricularService.buscarOcorrenciaNormais(oId)
                .chain(normais -> {
                    if (normais == null || normais.isEmpty()) return Uni.createFrom().voidItem();
                    return carregarChamadas(oId, normais, chamadas == null ? 0 : chamadas, false);
                });
    }

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

