package br.com.sol7.olimpio.basico.feriado.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Date;

import br.com.sol7.olimpio.basico.feriado.dto.FeriadoAjusteResponse;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoRequest;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoResponse;
import br.com.sol7.olimpio.basico.feriado.entity.Feriado;
import br.com.sol7.olimpio.basico.feriado.entity.FeriadoAjuste;
import br.com.sol7.olimpio.basico.feriado.producer.FeriadoKafkaProducer;
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
    FeriadoKafkaProducer kafkaProducer;

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

    // Migrado da troca de feriados (TrocaFeriadoDialog do listFeriado.xhtml) - reatribui as
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


    // Migrado de FeriadoController.atualizarOferecimento - agora envia trigger via Kafka
    // para o schedule executar a regra (FeriadoAjusteMaintenanceService)
    public Uni<String> atualizarOferecimento() {
        return kafkaProducer.enviarTrigger("verificaFeriadosParaajustar")
                .replaceWith("Trigger de ajuste geral enviado para o schedule");
    }


    // Migrado de FeriadoController.atualizarOferecimentoNaoAjustado - agora envia trigger via Kafka
    public Uni<String> atualizarOferecimentoNaoAjustado() {
        return kafkaProducer.enviarTrigger("executarAjusteNaoSelecionados")
                .replaceWith("Trigger de ajuste nao selecionados enviado para o schedule");
    }


    // Migrado de FeriadoController.atualizarOferecimentoAjustados - agora envia trigger via Kafka
    public Uni<String> atualizarOferecimentoAjustados() {
        return kafkaProducer.enviarTrigger("executarAjusteSelecionados")
                .replaceWith("Trigger de ajuste selecionados enviado para o schedule");
    }


    // Migrado de FeriadoController.buscarFeriadoApi (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FeriadoController.java:570, camada controller)
    // Logica original (adaptar):
    // public void buscarFeriadoApi() {
    // 
    //     }
    public Uni<Void> buscarFeriadoApi() {
        // Obs: metodo vazio no legado (sem logica de dados portaavel)
        return Uni.createFrom().voidItem();
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
    public Uni<Void> gerarNovasDatas() {
        // Obs: depende do ano alvo (campo de tela do controller JSF) e das relacoes
        // unidade/tipoCurso do Feriado (nao mapeadas localmente, outros microservicos)
        return Uni.createFrom().voidItem();
    }


    // Migrado de FeriadoService.buscarFeriadoUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:54, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id); parametro tipoCursoId: era TipoCurso (referencia por id)
    // JPQL original: Select f from Feriado f left join f.unidade u left join f.tipoCurso t where  ((u IN (?1)) or f.nacional = true )  and f.dataFeriado = ?2 and (t IN (?3) or f.todosCursos = true)
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoUnidade(Date data, Unidade unidade, TipoCurso tipoCurso) {
    //         return getFeriadoRepository().buscarFeriadoUnidade(unidade, data, tipoCurso);
    //     }
    public Uni<List<Long>> buscarFeriadoUnidade(Date data, Long unidadeId, Long tipoCursoId) {
        return repository.buscarFeriadoUnidade(unidadeId, data, tipoCursoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoFixo (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:58, camada service)
    // JPQL original: Select f from Feriado f left join fetch f.unidade u where f.feriadoFixo = true
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoFixo() {
    //         return getFeriadoRepository().buscarFeriadoFixo();
    //     }
    public Uni<List<Long>> buscarFeriadoFixo() {
        return repository.buscarFeriadoFixo().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.verificarFeriadoExistente (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:62, camada service)
    // Logica original (adaptar):
    // public Boolean verificarFeriadoExistente(Date data) {
    //         return !ObjectUtil.nullOrEmpty(getFeriadoRepository().verificarFeriadoExistente(data));
    //     }
    public Uni<Boolean> verificarFeriadoExistente(Date data) {
        return repository.verificarFeriadoExistente(data).map(list -> !list.isEmpty());
    }


    // Migrado de FeriadoService.buscarFeriadoDaUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:70, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: Select distinct  f from Feriado f left join fetch f.unidade u where (u IN (?1) or f.nacional = true) and f.dataFeriado between ?2 and ?3
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoDaUnidade(Unidade unidade, Date inicio, Date fim) {
    //         return getFeriadoRepository().buscarFeriadoDaUnidade(unidade, inicio, fim);
    //     }
    public Uni<List<Long>> buscarFeriadoDaUnidade(Long unidadeId, Date inicio, Date fim) {
        return repository.buscarFeriadoDaUnidade(unidadeId, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoDaUnidadeList (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:74, camada service)
    // JPQL original: Select distinct  f from Feriado f left join fetch f.unidade u where (u IN (?1) or f.nacional = true) and f.dataFeriado between ?2 and ?3
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoDaUnidadeList(List<Unidade> unidade, Date inicio, Date fim) {
    //         return getFeriadoRepository().buscarFeriadoDaUnidadeList(unidade, inicio, fim);
    //     }
    public Uni<List<Long>> buscarFeriadoDaUnidadeList(List<Long> unidade, Date inicio, Date fim) {
        return repository.buscarFeriadoDaUnidadeList(unidade, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoDaUnidadetipoCurso (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:78, camada service)
    // JPQL original: Select distinct  f from Feriado f left join f.unidade u where  f.dataFeriado between ?1 and ?2
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoDaUnidadetipoCurso(Date inicio, Date fim) {
    //         return getFeriadoRepository().buscarFeriadoDaUnidadetipoCurso(inicio, fim);
    //     }
    public Uni<List<Long>> buscarFeriadoDaUnidadetipoCurso(Date inicio, Date fim) {
        return repository.buscarFeriadoDaUnidadetipoCurso(inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoComUnidades (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:82, camada service)
    // Observacao: retorno: era Feriado (referencia por id); parametro entityId: era Feriado (referencia por id)
    // JPQL original: Select f from Feriado f left join fetch f.unidade u where  f = ?1
    // Logica original (adaptar):
    // public Feriado buscarFeriadoComUnidades(Feriado entity) {
    //         return getFeriadoRepository().buscarFeriadoComUnidades(entity);
    //     }
    public Uni<Long> buscarFeriadoComUnidades(Long entityId) {
        return repository.buscarFeriadoComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de FeriadoService.buscarFeriadosComUnidadeData (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:86, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: Select f from Feriado f left join f.unidade u left join f.tipoCurso tc where (u = (?1) or f.nacional = true) and f.dataFeriado = ?2 and tc is null
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadosComUnidadeData(Unidade unidade, Date data) {
    //         return getFeriadoRepository().buscarFeriadosComUnidadeData(unidade, data);
    //     }
    public Uni<List<Long>> buscarFeriadosComUnidadeData(Long unidadeId, Date data) {
        return repository.buscarFeriadosComUnidadeData(unidadeId, data).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoComTipoCurso (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:90, camada service)
    // Observacao: retorno: era Feriado (referencia por id); parametro entityId: era Feriado (referencia por id)
    // JPQL original: Select f from Feriado f left join fetch f.tipoCurso where f = ?1
    // Logica original (adaptar):
    // public Feriado buscarFeriadoComTipoCurso(Feriado entity) {
    //         return getFeriadoRepository().buscarFeriadoComTipoCurso(entity);
    //     }
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
    public Uni<Void> atualizarOferecimento2(List<Long> ocorrenciaComponenteCurriculars) {
        // Obs: depende do microservico educacao (OcorrenciaComponenteCurricular,
        // CadernoComponenteCurricular e tabelas edc_*)
        return Uni.createFrom().voidItem();
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
            SELECT f.id, f.nome, f.dt_feriado,
                   CASE WHEN f.fl_feriado_fixo = true THEN '#27ae60' ELSE '#3498db' END,
                   f.fl_feriado_fixo, f.fl_nacional, f.descricao
            FROM bas_feriado f
            ORDER BY f.dt_feriado
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql).getResultList()
                        .map(list -> list.stream().map(row -> {
                            Object[] arr = (Object[]) row;
                            return new CalendarioEventoResponse(
                                    ((Number) arr[0]).longValue(),
                                    (String) arr[1],
                                    (Date) arr[2],
                                    (String) arr[3],
                                    (Boolean) arr[4],
                                    (Boolean) arr[5],
                                    (String) arr[6]
                            );
                        }).toList()));
    }

    public Uni<List<OcorrenciaFeriadoResponse>> ocorrenciasAjustar(Long feriadoAjusteId) {
        String sql = """
            SELECT o.id, o.data, o.id_oferecimento_componente_curricular,
                   ofe.id, ofe.id_grupo, g.nome,
                   ofe.id_unidade, u.sucinto,
                   ofe.id_curso, c.nome,
                   ofe.id_componente_curricular, cc.descricao,
                   cc.carga_horaria,
                   ofe.status,
                   ofe.inscritos, ofe.vagas,
                   o.id_dia_aula, da.nome,
                   tu.descricao,
                   ta.descricao
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
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, feriadoAjusteId)
                        .getResultList()
                        .map(list -> list.stream().map(row -> {
                            Object[] arr = (Object[]) row;
                            return new OcorrenciaFeriadoResponse(
                                    ((Number) arr[0]).longValue(),
                                    (Date) arr[1],
                                    ((Number) arr[2]).longValue(),
                                    (String) arr[3],
                                    arr[4] != null ? ((Number) arr[4]).longValue() : null,
                                    (String) arr[5],
                                    arr[6] != null ? ((Number) arr[6]).longValue() : null,
                                    (String) arr[7],
                                    arr[8] != null ? ((Number) arr[8]).longValue() : null,
                                    (String) arr[9],
                                    arr[10] != null ? ((Number) arr[10]).longValue() : null,
                                    (String) arr[11],
                                    arr[12] != null ? ((Number) arr[12]).intValue() : null,
                                    (String) arr[13],
                                    arr[14] != null ? ((Number) arr[14]).intValue() : null,
                                    arr[15] != null ? ((Number) arr[15]).intValue() : null,
                                    arr[16] != null ? ((Number) arr[16]).longValue() : null,
                                    (String) arr[17],
                                    (String) arr[18],
                                    (String) arr[19]
                            );
                        }).toList()));
    }

    public Uni<List<OcorrenciaFeriadoResponse>> ocorrenciasNaoAjustar(Long feriadoAjusteId) {
        String sql = """
            SELECT o.id, o.data, o.id_oferecimento_componente_curricular,
                   ofe.id, ofe.id_grupo, g.nome,
                   ofe.id_unidade, u.sucinto,
                   ofe.id_curso, c.nome,
                   ofe.id_componente_curricular, cc.descricao,
                   cc.carga_horaria,
                   ofe.status,
                   ofe.inscritos, ofe.vagas,
                   o.id_dia_aula, da.nome,
                   tu.descricao,
                   ta.descricao
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
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, feriadoAjusteId)
                        .getResultList()
                        .map(list -> list.stream().map(row -> {
                            Object[] arr = (Object[]) row;
                            return new OcorrenciaFeriadoResponse(
                                    ((Number) arr[0]).longValue(),
                                    (Date) arr[1],
                                    ((Number) arr[2]).longValue(),
                                    (String) arr[3],
                                    arr[4] != null ? ((Number) arr[4]).longValue() : null,
                                    (String) arr[5],
                                    arr[6] != null ? ((Number) arr[6]).longValue() : null,
                                    (String) arr[7],
                                    arr[8] != null ? ((Number) arr[8]).longValue() : null,
                                    (String) arr[9],
                                    arr[10] != null ? ((Number) arr[10]).longValue() : null,
                                    (String) arr[11],
                                    arr[12] != null ? ((Number) arr[12]).intValue() : null,
                                    (String) arr[13],
                                    arr[14] != null ? ((Number) arr[14]).intValue() : null,
                                    arr[15] != null ? ((Number) arr[15]).intValue() : null,
                                    arr[16] != null ? ((Number) arr[16]).longValue() : null,
                                    (String) arr[17],
                                    (String) arr[18],
                                    (String) arr[19]
                            );
                        }).toList()));
    }
}
