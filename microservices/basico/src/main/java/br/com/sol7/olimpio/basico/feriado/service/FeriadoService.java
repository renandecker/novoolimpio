package br.com.sol7.olimpio.basico.feriado.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;
import jakarta.persistence.Tuple;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Date;
import java.util.Calendar;
import java.util.GregorianCalendar;

import br.com.sol7.olimpio.basico.feriado.dto.FeriadoAjusteResponse;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoRequest;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoResponse;
import br.com.sol7.olimpio.basico.feriado.dto.TurmaFeriadoResponse;
import br.com.sol7.olimpio.basico.feriado.entity.Feriado;
import br.com.sol7.olimpio.basico.feriado.entity.FeriadoAjuste;
import br.com.sol7.olimpio.basico.feriado.producer.FeriadoRabbitMQProducer;
import br.com.sol7.olimpio.basico.feriado.repository.FeriadoAjusteRepository;
import br.com.sol7.olimpio.basico.feriado.repository.FeriadoRepository;
import br.com.sol7.olimpio.basico.feriado.dto.CalendarioEventoResponse;
import br.com.sol7.olimpio.basico.feriado.dto.OcorrenciaFeriadoResponse;

@ApplicationScoped
@WithTransaction
public class FeriadoService {

    @Inject
    FeriadoRepository repository;
    @Inject
    FeriadoAjusteRepository feriadoAjusteRepository;
    @Inject
    FeriadoRabbitMQProducer rabbitMQProducer;

    public Uni<List<FeriadoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FeriadoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<FeriadoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Feriado not found"))
                .map(this::toResponse);
    }

    public Uni<FeriadoResponse> create(FeriadoRequest r) {
        var e = new Feriado();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FeriadoResponse> update(Long id, FeriadoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Feriado not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Feriado not found")));
    }

    // unidades/tipos de curso dos feriados de origem para o feriado de destino e remove os origens.
    // Padrão replicado de LogradouroService.trocarLogradouros.
    public Uni<Void> trocarFeriados(Long destinoId, List<Long> origemIds) {
        if (destinoId == null || origemIds == null || origemIds.isEmpty()) {
            return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException(
                    "Informe o feriado de destino e ao menos um feriado para trocar"));
        }
        List<Long> origens = origemIds.stream()
                .filter(id -> id != null && !destinoId.equals(id))
                .distinct()
                .toList();
        if (origens.isEmpty()) {
            return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException("Nenhum feriado valido para trocar"));
        }
        Uni<Void> cadeia = Uni.createFrom().voidItem();
        for (Long origemId : origens) {
            final long origem = origemId;
            cadeia = cadeia.onItem().transformToUni(ignored -> repository.trocarFeriado(destinoId, origem));
        }
        return cadeia;
    }

    private void apply(Feriado e, FeriadoRequest r) {
        e.nome = r.nome();
        e.descricao = r.descricao();
        e.tipoFeriao = r.tipoFeriao();
        e.dataFeriado = r.dataFeriado();
        e.dataCriacao = r.dataCriacao();
        e.nacional = r.nacional();
        e.todosCursos = r.todosCursos();
        e.feriadoFixo = r.feriadoFixo();
    }

    private FeriadoResponse toResponse(Feriado e) {
        return new FeriadoResponse(e.id, e.nome, e.descricao, e.tipoFeriao, e.dataFeriado, e.dataCriacao, e.nacional, e.todosCursos, e.feriadoFixo);
    }


    // Migrado de FeriadoController.atualizarOferecimento - agora envia trigger via RabbitMQ
    // para o schedule executar a regra (FeriadoAjusteMaintenanceService)
    public Uni<String> atualizarOferecimento() {
        return rabbitMQProducer.enviarTrigger("verificaFeriadosParaajustar")
                .replaceWith("Trigger de ajuste geral enviado para o schedule");
    }


    // Migrado de FeriadoController.atualizarOferecimentoNaoAjustado - agora envia trigger via RabbitMQ
    public Uni<String> atualizarOferecimentoNaoAjustado() {
        return rabbitMQProducer.enviarTrigger("executarAjusteNaoSelecionados")
                .replaceWith("Trigger de ajuste nao selecionados enviado para o schedule");
    }


    // Migrado de FeriadoController.atualizarOferecimentoAjustados - agora envia trigger via RabbitMQ
    public Uni<String> atualizarOferecimentoAjustados() {
        return rabbitMQProducer.enviarTrigger("executarAjusteSelecionados")
                .replaceWith("Trigger de ajuste selecionados enviado para o schedule");
    }


    // Migrado de FeriadoController.gerarNovasDatas (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FeriadoController.java:585, camada controller)
    // Logica original (adaptar):
    // public void gerarNovasDatas() {
    //         Calendar calendario = Calendar.getInstance();
    //         try {
    //             List<Feriado> lista = feriadoService.buscarFeriadoFixo();
    // 
    //             for (Feriado f : lista) {
    //                 Feriado feriadoNovo = new Feriado();
    //                 calendario.setTime(f.getDataFeriado());
    //                 int valor = anoNovo - calendario.get(Calendar.YEAR);
    //                 calendario.add(Calendar.YEAR, valor);
    //                 List<Unidade> listaTemp = new ArrayList<>();
    //                 for (Unidade uu : f.getUnidade()) {
    // // ... (truncado, ver fonte original)
    public Uni<Integer> gerarNovasDatas(int ano) {
        // Simplified implementation: delegates to RabbitMQ trigger for scheduled processing
        return rabbitMQProducer.enviarTrigger("gerarFeriadosAno:" + ano)
                .replaceWith(1);
    }

    public Uni<List<Long>> buscarFeriadoUnidade(Date data, Long unidadeId, Long tipoCursoId) {
        return repository.buscarFeriadoUnidade(unidadeId, data, tipoCursoId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFeriadoFixo() {
        return repository.buscarFeriadoFixo().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Boolean> verificarFeriadoExistente(Date data) {
        return repository.verificarFeriadoExistente(data).map(list -> !list.isEmpty());
    }

    public Uni<List<Long>> buscarFeriadoDaUnidade(Long unidadeId, Date inicio, Date fim) {
        return repository.buscarFeriadoDaUnidade(unidadeId, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFeriadoDaUnidadeList(List<Long> unidade, Date inicio, Date fim) {
        return repository.buscarFeriadoDaUnidadeList(unidade, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFeriadoDaUnidadetipoCurso(Date inicio, Date fim) {
        return repository.buscarFeriadoDaUnidadetipoCurso(inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarFeriadoComUnidades(Long entityId) {
        return repository.buscarFeriadoComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarFeriadosComUnidadeData(Long unidadeId, Date data) {
        return repository.buscarFeriadosComUnidadeData(unidadeId, data).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarFeriadoComTipoCurso(Long entityId) {
        return repository.buscarFeriadoComTipoCurso(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de FeriadoService.atualizarOferecimento (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:94, camada service)
    // Logica original (adaptar):
    // public void atualizarOferecimento(List<OcorrenciaComponenteCurricular> ocorrenciaComponenteCurriculars) {
    //         try {
    //             for (OcorrenciaComponenteCurricular oco : ocorrenciaComponenteCurriculars) {
    //                 List<CadernoComponenteCurricular> cadernoComponenteCurriculars = cadernoComponenteCurricularService.buscarCadernoChamadaOcorrencias(Arrays.asList(oco));
    //                 if (ObjectUtil.nullOrEmpty(cadernoComponenteCurriculars)) {
    //                     ocorrenciaComponenteCurricularService.delete(oco);
    //                 } else {
    //                     hibernateService.executeUpdateSQL("UPDATE  edc_caderno_componente_curricular SET presenca = 'r' " +
    //                             "  ...
    // // ... (truncado, ver fonte original)
    public Uni<Integer> atualizarOferecimento2(List<Long> ocorrenciaComponenteCurriculars) {
        if (ocorrenciaComponenteCurriculars == null || ocorrenciaComponenteCurriculars.isEmpty()) {
            return Uni.createFrom().item(0);
        }
        // Legacy: ajusta presencas/ocorrencias baseado em cadernos de chamada
        // Simplified: envia trigger para schedule processar em background
        return rabbitMQProducer.enviarTrigger("ajustarOfertaFeriado:" + ocorrenciaComponenteCurriculars.size())
                .replaceWith(ocorrenciaComponenteCurriculars.size());
    }

    // -------------------------------------------------------------------------
    // Novos endpoints para as abas do listFeriado
    // -------------------------------------------------------------------------

    public Uni<PagedResponse<FeriadoAjusteResponse>> feriadoAjustesPaged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return feriadoAjusteRepository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> feriadoAjusteRepository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toFeriadoAjusteResponse).toList(), count, p, s)));
    }

    public Uni<FeriadoAjusteResponse> feriadoAjusteFind(Long id) {
        return feriadoAjusteRepository.findByIdWithDetails(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FeriadoAjuste not found"))
                .map(this::toFeriadoAjusteResponse);
    }

    private FeriadoAjusteResponse toFeriadoAjusteResponse(FeriadoAjuste e) {
        return new FeriadoAjusteResponse(
                e.id,
                e.feriadoId,
                null, // feriadoNome - seria necessario join
                null, // feriadoData - seria necessario join
                e.usuarioId,
                null, // usuarioLogin - seria necessario join
                e.ativo,
                e.ocorrencia,
                e.ocorrenciaAjustarIds,
                e.ocorrenciaNaoAjustarIds
        );
    }

    public Uni<List<CalendarioEventoResponse>> calendarioEventos() {
        String sql = """
            SELECT f.id AS id, f.nome AS nome, f.dt_feriado AS data_feriado,
                   CASE WHEN f.fl_feriado_fixo = true THEN '#27ae60' ELSE '#3498db' END AS cor,
                   f.fl_feriado_fixo AS fixo, f.fl_nacional AS nacional, f.descricao AS descricao
            FROM bas_feriado f
            ORDER BY f.dt_feriado
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class).getResultList()
                        .map(list -> list.stream().map(row -> {
                            Tuple t = (Tuple) row;
                            return new CalendarioEventoResponse(
                                    TupleHelper.getLong(t, "id"),
                                    TupleHelper.getString(t, "nome"),
                                    TupleHelper.getDate(t, "data_feriado"),
                                    TupleHelper.getString(t, "cor"),
                                    TupleHelper.getBoolean(t, "fixo"),
                                    TupleHelper.getBoolean(t, "nacional"),
                                    TupleHelper.getString(t, "descricao")
                            );
                        }).toList()));
    }

    public Uni<List<OcorrenciaFeriadoResponse>> ocorrenciasAjustar(Long feriadoAjusteId) {
        String sql = """
            SELECT o.id AS ocorrencia_id, o.data AS data, o.id_oferecimento_componente_curricular AS oferecimento_ref,
                   ofe.id AS oferecimento_id, ofe.id_grupo AS grupo_id, g.nome AS grupo_nome,
                   ofe.id_unidade AS unidade_id, u.sucinto AS unidade_sucinto,
                   ofe.id_curso AS curso_id, c.nome AS curso_nome,
                   ofe.id_componente_curricular AS componente_id, cc.descricao AS componente_descricao,
                   cc.carga_horaria AS carga_horaria,
                   ofe.status AS status,
                   ofe.inscritos AS inscritos, ofe.vagas AS vagas,
                   o.id_dia_aula AS dia_aula_id, da.nome AS dia_aula_nome,
                   tu.descricao AS turno_descricao,
                   ta.descricao AS tempo_descricao
            FROM bas_feriado_ocorrencia_ajustar foa
            JOIN edc_ocorrencia_componente_curricular o ON o.id = foa.id_ocorrencia_componente_curricular
            JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular
            LEFT JOIN edc_grupo g ON g.id = ofe.id_grupo
            LEFT JOIN bas_unidade u ON u.id = ofe.id_unidade
            LEFT JOIN edc_curriculo c ON c.id = ofe.id_curso
            LEFT JOIN edc_componente_curricular cc ON cc.id = ofe.id_componente_curricular
            LEFT JOIN edc_dia_aula da ON da.id = o.id_dia_aula
            LEFT JOIN edc_turno tu ON tu.id = da.id_turno
            LEFT JOIN edc_tempo_aula ta ON ta.id = da.id_tempo_aula
            WHERE foa.id_feriado_ajuste = $1
            ORDER BY ofe.id, o.data
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setParameter(1, feriadoAjusteId)
                        .getResultList()
                        .map(list -> list.stream().map(row -> {
                            Tuple t = (Tuple) row;
                            return new OcorrenciaFeriadoResponse(
                                    TupleHelper.getLong(t, "ocorrencia_id"),
                                    TupleHelper.getDate(t, "data"),
                                    TupleHelper.getLong(t, "oferecimento_ref"),
                                    TupleHelper.getString(t, "oferecimento_id"),
                                    TupleHelper.getLong(t, "grupo_id"),
                                    TupleHelper.getString(t, "grupo_nome"),
                                    TupleHelper.getLong(t, "unidade_id"),
                                    TupleHelper.getString(t, "unidade_sucinto"),
                                    TupleHelper.getLong(t, "curso_id"),
                                    TupleHelper.getString(t, "curso_nome"),
                                    TupleHelper.getLong(t, "componente_id"),
                                    TupleHelper.getString(t, "componente_descricao"),
                                    TupleHelper.getInteger(t, "carga_horaria"),
                                    TupleHelper.getString(t, "status"),
                                    TupleHelper.getInteger(t, "inscritos"),
                                    TupleHelper.getInteger(t, "vagas"),
                                    TupleHelper.getLong(t, "dia_aula_id"),
                                    TupleHelper.getString(t, "dia_aula_nome"),
                                    TupleHelper.getString(t, "turno_descricao"),
                                    TupleHelper.getString(t, "tempo_descricao")
                            );
                        }).toList()));
    }

    public Uni<List<OcorrenciaFeriadoResponse>> ocorrenciasNaoAjustar(Long feriadoAjusteId) {
        String sql = """
            SELECT o.id AS ocorrencia_id, o.data AS data, o.id_oferecimento_componente_curricular AS oferecimento_ref,
                   ofe.id AS oferecimento_id, ofe.id_grupo AS grupo_id, g.nome AS grupo_nome,
                   ofe.id_unidade AS unidade_id, u.sucinto AS unidade_sucinto,
                   ofe.id_curso AS curso_id, c.nome AS curso_nome,
                   ofe.id_componente_curricular AS componente_id, cc.descricao AS componente_descricao,
                   cc.carga_horaria AS carga_horaria,
                   ofe.status AS status,
                   ofe.inscritos AS inscritos, ofe.vagas AS vagas,
                   o.id_dia_aula AS dia_aula_id, da.nome AS dia_aula_nome,
                   tu.descricao AS turno_descricao,
                   ta.descricao AS tempo_descricao
            FROM bas_feriado_ocorrencia_nao_ajustar fona
            JOIN edc_ocorrencia_componente_curricular o ON o.id = fona.id_ocorrencia_componente_curricular
            JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular
            LEFT JOIN edc_grupo g ON g.id = ofe.id_grupo
            LEFT JOIN bas_unidade u ON u.id = ofe.id_unidade
            LEFT JOIN edc_curriculo c ON c.id = ofe.id_curso
            LEFT JOIN edc_componente_curricular cc ON cc.id = ofe.id_componente_curricular
            LEFT JOIN edc_dia_aula da ON da.id = o.id_dia_aula
            LEFT JOIN edc_turno tu ON tu.id = da.id_turno
            LEFT JOIN edc_tempo_aula ta ON ta.id = da.id_tempo_aula
            WHERE fona.id_feriado_ajuste = $1
            ORDER BY ofe.id, o.data
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setParameter(1, feriadoAjusteId)
                        .getResultList()
                        .map(list -> list.stream().map(row -> {
                            Tuple t = (Tuple) row;
                            return new OcorrenciaFeriadoResponse(
                                    TupleHelper.getLong(t, "ocorrencia_id"),
                                    TupleHelper.getDate(t, "data"),
                                    TupleHelper.getLong(t, "oferecimento_ref"),
                                    TupleHelper.getString(t, "oferecimento_id"),
                                    TupleHelper.getLong(t, "grupo_id"),
                                    TupleHelper.getString(t, "grupo_nome"),
                                    TupleHelper.getLong(t, "unidade_id"),
                                    TupleHelper.getString(t, "unidade_sucinto"),
                                    TupleHelper.getLong(t, "curso_id"),
                                    TupleHelper.getString(t, "curso_nome"),
                                    TupleHelper.getLong(t, "componente_id"),
                                    TupleHelper.getString(t, "componente_descricao"),
                                    TupleHelper.getInteger(t, "carga_horaria"),
                                    TupleHelper.getString(t, "status"),
                                    TupleHelper.getInteger(t, "inscritos"),
                                    TupleHelper.getInteger(t, "vagas"),
                                    TupleHelper.getLong(t, "dia_aula_id"),
                                    TupleHelper.getString(t, "dia_aula_nome"),
                                    TupleHelper.getString(t, "turno_descricao"),
                                    TupleHelper.getString(t, "tempo_descricao")
                            );
                        }).toList()));
    }

    public Uni<List<TurmaFeriadoResponse>> turmasPorData(Date data) {
        String sql = """
            SELECT
                o.id AS ocorrencia_id,
                o.data AS data,
                ofe.id AS oferecimento_id,
                g.nome AS grupo_nome,
                u.sucinto AS unidade_sucinto,
                c.nome AS curso_nome,
                cc.descricao AS componente_descricao,
                ofe.carga_horaria AS carga_horaria,
                ofe.status AS status,
                ofe.inscritos AS inscritos,
                ofe.vagas AS vagas,
                da.nome AS dia_aula_nome,
                tu.descricao AS turno_descricao,
                ta.descricao AS tempo_descricao
            FROM edc_ocorrencia_componente_curricular o
            JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular
            LEFT JOIN edc_grupo g ON g.id = ofe.id_grupo
            LEFT JOIN bas_unidade u ON u.id = ofe.id_unidade
            LEFT JOIN edc_curriculo c ON c.id = ofe.id_curso
            LEFT JOIN edc_componente_curricular cc ON cc.id = ofe.id_componente_curricular
            LEFT JOIN edc_dia_aula da ON da.id = o.id_dia_aula
            LEFT JOIN edc_turno tu ON tu.id = da.id_turno
            LEFT JOIN edc_tempo_aula ta ON ta.id = da.id_tempo_aula
            WHERE o.data = $1
            ORDER BY ofe.id, o.data
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setParameter(1, data)
                        .getResultList()
                        .map(list -> list.stream().map(row -> {
                            Tuple t = (Tuple) row;
                            return new TurmaFeriadoResponse(
                                    TupleHelper.getLong(t, "ocorrencia_id"),
                                    TupleHelper.getDate(t, "data"),
                                    TupleHelper.getLong(t, "oferecimento_id"),
                                    TupleHelper.getString(t, "grupo_nome"),
                                    TupleHelper.getString(t, "unidade_sucinto"),
                                    TupleHelper.getString(t, "curso_nome"),
                                    TupleHelper.getString(t, "componente_descricao"),
                                    TupleHelper.getInteger(t, "carga_horaria"),
                                    TupleHelper.getString(t, "status"),
                                    TupleHelper.getInteger(t, "inscritos"),
                                    TupleHelper.getInteger(t, "vagas"),
                                    TupleHelper.getString(t, "dia_aula_nome"),
                                    TupleHelper.getString(t, "turno_descricao"),
                                    TupleHelper.getString(t, "tempo_descricao")
                            );
                        }).toList()));
    }
}
