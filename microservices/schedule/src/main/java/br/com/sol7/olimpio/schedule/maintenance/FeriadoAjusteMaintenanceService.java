package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

/**
 * Migado de br.com.sol7.olimpio.basico.feriado.service.FeriadoAjusteService.
 * Executa a regra de ajuste de feriados/oferecimentos no microsservico schedule,
 * consumindo triggers do cron (SchedulingJobs) ou de chamadas manuais via Kafka.
 */
@ApplicationScoped
public class FeriadoAjusteMaintenanceService {

    private static final Logger LOG = Logger.getLogger(FeriadoAjusteMaintenanceService.class);

    @Inject
    Pool pool;

    private static final String CHAVE_CONFIG = "FERIADO_AJUSTE";
    private static final String SQL_CONFIG = "SELECT valor FROM bas_config WHERE chave = $1";
    private static final String SQL_UPDATE_CONFIG = "UPDATE bas_config SET valor = $1 WHERE chave = $2";

    private static final String SQL_BUSCAR_AJUSTES_ATIVOS =
            "SELECT faj.id, faj.id_feriado, faj.fl_ocorrencia FROM bas_feriado_ajuste faj " +
                    "JOIN bas_feriado f ON f.id = faj.id_feriado " +
                    "WHERE faj.fl_ativo = true ORDER BY f.dt_feriado, faj.id LIMIT 50";

    private static final String SQL_BUSCAR_AJUSTES_ATIVOS_APOS =
            "SELECT faj.id, faj.id_feriado, faj.fl_ocorrencia FROM bas_feriado_ajuste faj " +
                    "JOIN bas_feriado f ON f.id = faj.id_feriado " +
                    "WHERE faj.fl_ativo = true AND faj.id > $1 ORDER BY f.dt_feriado, faj.id LIMIT 50";

    private static final String SQL_FERIADO_DATA = "SELECT dt_feriado FROM bas_feriado WHERE id = $1";
    private static final String SQL_FERIADO_UNIDADES = "SELECT id_unidade FROM bas_feriado_unidade WHERE id_feriado = $1";

    private static final String SQL_AJUSTAR_IDS =
            "SELECT id_ocorrencia_componente_curricular FROM bas_feriado_ocorrencia_ajustar WHERE id_feriado_ajuste = $1";
    private static final String SQL_NAO_AJUSTAR_IDS =
            "SELECT id_ocorrencia_componente_curricular FROM bas_feriado_ocorrencia_nao_ajustar WHERE id_feriado_ajuste = $1";
    private static final String SQL_DESATIVAR_AJUSTE = "UPDATE bas_feriado_ajuste SET fl_ativo = false WHERE id = $1";

    private static final String SQL_OCORRENCIA_OFERECIMENTO =
            "SELECT id_oferecimento_componente_curricular, id_dia_aula FROM edc_ocorrencia_componente_curricular WHERE id = $1";
    private static final String SQL_CONTAR_CADERNOS =
            "SELECT count(*) AS total FROM edc_caderno_componente_curricular WHERE id_ocorrencia_componente_curricular = $1";
    private static final String SQL_MARCAR_CADERNO_REMOVIDO =
            "UPDATE edc_caderno_componente_curricular SET presenca = 'r' " +
                    "WHERE presenca NOT IN ('i','c','v') AND id_ocorrencia_componente_curricular = $1";
    private static final String SQL_DELETE_OCORRENCIA = "DELETE FROM edc_ocorrencia_componente_curricular WHERE id = $1";
    private static final String SQL_DESATIVAR_OCORRENCIA = "UPDATE edc_ocorrencia_componente_curricular SET fl_ativo = false WHERE id = $1";

    private static final String SQL_OFERECIMENTO =
            "SELECT id_unidade, id_sala, id_professor, id_curso, data_inicio, data_fim " +
                    "FROM edc_oferecimento_componente_curricular WHERE id = $1";
    private static final String SQL_TIPO_CURSO = "SELECT id_tipo_curso FROM edc_curriculo WHERE id = $1";
    private static final String SQL_DIA_AULA = "SELECT id_dia_semana FROM edc_dia_aula WHERE id = $1";
    private static final String SQL_CRITERIO =
            "SELECT data_inicio, data_fim FROM edc_criterio WHERE id_curriculo = $1 AND id_unidade = $2 ORDER BY id DESC LIMIT 1";
    private static final String SQL_VERIFICAR_FERIADO =
            "SELECT count(f.id) AS total FROM bas_feriado f " +
                    "LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id " +
                    "LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade " +
                    "LEFT JOIN bas_feriado_tipo_curso f_t_jt ON f_t_jt.id_feriado = f.id " +
                    "LEFT JOIN edc_tipo_curso t ON t.id = f_t_jt.id_tipo_curso " +
                    "WHERE ((u.id = $1) OR f.fl_nacional = true) AND f.dt_feriado = $2 AND (t.id = $3 OR f.fl_tipo_curso = true)";
    private static final String SQL_INSERIR_OCORRENCIA =
            "INSERT INTO edc_ocorrencia_componente_curricular " +
                    "(id_oferecimento_componente_curricular, id_sala, id_professor, data, id_dia_aula, " +
                    "aula_coringa, aula_presencial, fl_ativo) " +
                    "VALUES ($1, $2, $3, $4, $5, false, true, true) RETURNING id";
    private static final String SQL_RECALCULAR_DATAS =
            "SELECT min(data) AS inicio, max(data) AS fim FROM edc_ocorrencia_componente_curricular " +
                    "WHERE id_oferecimento_componente_curricular = $1 AND fl_ativo = true";
    private static final String SQL_ATUALIZAR_DATAS =
            "UPDATE edc_oferecimento_componente_curricular SET data_inicio = $2, data_fim = $3 WHERE id = $1";
    private static final String SQL_ATUALIZAR_STATUS_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular o SET status = " +
                    "(case when o.data_inicio > current_date and o.vagas <= o.inscritos then 'LOTADA' " +
                    " when o.data_inicio > current_date and o.vagas > o.inscritos then 'LIBERADA' " +
                    " when o.data_inicio < current_date and o.data_fim > current_date then 'EM_ANDAMENTO' " +
                    " when o.data_fim < current_date then 'FINALIZADA' " +
                    " when o.data_cancelamento is not null then 'CANCELADA' else 'LIBERADA' end) " +
                    "WHERE o.id = $1";
    private static final String SQL_INSERIR_CADERNO =
            "INSERT INTO edc_caderno_componente_curricular(id_matricula, id_ocorrencia_componente_curricular, presenca, data_alteracao) " +
                    "SELECT DISTINCT m.id, o.id, 'n', now() FROM edc_matricula m " +
                    "INNER JOIN edc_oferecimento_componente_curricular of ON (of.id = m.id_oferecimento_componente_curricular) " +
                    "INNER JOIN edc_contrato cc ON (cc.id = m.id_contrato) " +
                    "INNER JOIN edc_ocorrencia_componente_curricular o ON (o.id_oferecimento_componente_curricular = of.id) " +
                    "LEFT JOIN edc_caderno_componente_curricular c ON (c.id_ocorrencia_componente_curricular = o.id AND m.id = c.id_matricula) " +
                    "WHERE o.fl_ativo = true AND c.id IS NULL AND m.status != 'CANCELADO' " +
                    "AND cc.desistente = false AND cc.ativo = true AND of.id = $1 GROUP BY 1,2,3,4";
    private static final String SQL_CONFLITOS =
            "SELECT o.id, o.id_dia_aula, o.id_oferecimento_componente_curricular AS id_oferecimento, tu.inicio, tu.fim " +
                    "FROM edc_ocorrencia_componente_curricular o " +
                    "JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular " +
                    "JOIN bas_unidade u ON u.id = ofe.id_unidade " +
                    "LEFT JOIN edc_dia_aula da ON da.id = o.id_dia_aula " +
                    "LEFT JOIN edc_turno tu ON tu.id = da.id_turno " +
                    "WHERE u.fl_ativo = true AND o.fl_ativo = true AND o.data = $1 AND o.id_sala = $2 AND ofe.id_unidade = $3";
    private static final String SQL_CONFLITO_CADERNO =
            "UPDATE edc_caderno_componente_curricular SET presenca = 'r', data_alteracao = now() " +
                    "WHERE id_ocorrencia_componente_curricular = $1";
    private static final String SQL_TURNO =
            "SELECT tu.inicio, tu.fim FROM edc_turno tu WHERE tu.id = (SELECT id_turno FROM edc_dia_aula WHERE id = $1)";

    private static final int MAX_DIAS_BUSCA = 400;

    public record FeriadoAjusteItem(Long id, Long feriadoId, Boolean ocorrencia) {}
    private record FeriadoRow(LocalDate data, List<Long> unidades) {}
    private record OferDiaRow(Long oferecimentoId, Long diaAulaId) {}
    private record OferecimentoRow(Long idUnidade, Long idSala, Long idProfessor, Long idCurso,
                                   LocalDate dataInicio, LocalDate dataFim) {}
    private record CriterioRow(LocalDate dataInicio, LocalDate dataFim) {}
    private record DatasRow(LocalDate inicio, LocalDate fim) {}
    private record TurnoRow(LocalTime inicio, LocalTime fim) {}
    private record ConflitoRow(Long idOcorrencia, Long idDiaAula, LocalTime inicio, LocalTime fim, Long idOferecimento) {}

    // -----------------------------------------------------------------------------------------
    // Rotina agendada / manual - verificaFeriadosParaajustar
    // -----------------------------------------------------------------------------------------

    public Uni<Void> verificaFeriadosParaajustar() {
        return buscarConfigValor()
                .chain(valor -> {
                    if (valor != null && !valor.trim().isEmpty()) {
                        try {
                            return buscarAjustesAtivosApos(Long.valueOf(valor.trim()));
                        } catch (NumberFormatException e) {
                            LOG.warnf("FeriadoAjusteMaintenance - config FERIADO_AJUSTE invalida ('%s'), carregando todos os ativos", valor);
                        }
                    }
                    return buscarAjustesAtivos();
                })
                .chain(lista -> lista.isEmpty() ? buscarAjustesAtivos() : Uni.createFrom().item(lista))
                .chain(lista -> {
                    if (lista.isEmpty()) {
                        LOG.info("FeriadoAjusteMaintenance - nenhum ajuste de feriado pendente");
                        return Uni.createFrom().voidItem();
                    }
                    Long ultimoId = lista.get(lista.size() - 1).id();
                    LOG.infof("FeriadoAjusteMaintenance - %d ajuste(s) pendente(s), ultimo id=%d", lista.size(), ultimoId);
                    return atualizarConfigValor(String.valueOf(ultimoId))
                            .chain(() -> atualizarOferecimento(lista));
                });
    }

    public Uni<String> executarAjusteGeral() {
        return verificaFeriadosParaajustar().replaceWith("Ajustados oferecimentos com sucesso");
    }

    public Uni<String> executarAjusteSelecionados() {
        return buscarAjustesAtivos().chain(lista -> {
            Uni<Void> chain = Uni.createFrom().voidItem();
            for (FeriadoAjusteItem item : lista) {
                chain = chain.chain(() -> buscarIdsAjustar(item.id())
                        .chain(ajustar -> ajustar.isEmpty() ? Uni.createFrom().voidItem() : ajustarOcorrencias(ajustar))
                        .chain(() -> desativarAjuste(item.id())));
            }
            return chain;
        }).replaceWith("Criado ajuste de ocorrencias ajustaveis com sucesso");
    }

    public Uni<String> executarAjusteNaoSelecionados() {
        return buscarAjustesAtivos().chain(lista -> {
            Uni<Void> chain = Uni.createFrom().voidItem();
            for (FeriadoAjusteItem item : lista) {
                chain = chain.chain(() -> buscarFeriadoComUnidades(item.feriadoId())
                        .chain(feriado -> buscarIdsNaoAjustar(item.id())
                                .chain(naoAjustar -> naoAjustar.isEmpty() ? Uni.createFrom().voidItem()
                                        : buscarOcorrenciasPorDataUnidade(feriado.data(), feriado.unidades())
                                                .chain(ids -> {
                                                    List<Long> restantes = ids.stream().filter(id -> !naoAjustar.contains(id)).toList();
                                                    return restantes.isEmpty() ? Uni.createFrom().voidItem() : ajustarOcorrencias(restantes);
                                                })))
                                .chain(() -> desativarAjuste(item.id())));
            }
            return chain;
        }).replaceWith("Criado ajuste de ocorrencias nao ajustaveis com sucesso");
    }

    // -----------------------------------------------------------------------------------------
    // Helpers internos
    // -----------------------------------------------------------------------------------------

    private Uni<Void> atualizarOferecimento(List<FeriadoAjusteItem> lista) {
        return processarLote(lista).chain(() -> verificaFeriadosParaajustar());
    }

    private Uni<Void> processarLote(List<FeriadoAjusteItem> lista) {
        Uni<Void> chain = Uni.createFrom().voidItem();
        for (FeriadoAjusteItem item : lista) {
            chain = chain.chain(() -> processarAjuste(item));
        }
        return chain;
    }

    private Uni<Void> processarAjuste(FeriadoAjusteItem item) {
        return buscarFeriadoComUnidades(item.feriadoId()).chain(feriado -> {
            if (feriado.data() == null) {
                return Uni.createFrom().voidItem();
            }
            if (item.ocorrencia() == null || !item.ocorrencia()) {
                return buscarOcorrenciasPorDataUnidade(feriado.data(), feriado.unidades())
                        .chain(ids -> ids.isEmpty() ? Uni.createFrom().voidItem() : ajustarOcorrencias(ids));
            }
            return buscarIdsAjustar(item.id()).chain(ajustar -> {
                Uni<Void> r = ajustar.isEmpty() ? Uni.createFrom().voidItem() : ajustarOcorrencias(ajustar);
                return r.chain(() -> buscarIdsNaoAjustar(item.id()).chain(naoAjustar -> {
                    if (naoAjustar.isEmpty()) {
                        return Uni.createFrom().voidItem();
                    }
                    return buscarOcorrenciasPorDataUnidade(feriado.data(), feriado.unidades()).chain(ids -> {
                        List<Long> restantes = ids.stream().filter(id -> !naoAjustar.contains(id)).toList();
                        return restantes.isEmpty() ? Uni.createFrom().voidItem() : ajustarOcorrencias(restantes);
                    });
                }));
            });
        })
                .chain(() -> desativarAjuste(item.id()))
                .invoke(() -> LOG.infof("FeriadoAjusteMaintenance - feriado_ajuste %d processado", item.id()));
    }

    public Uni<Void> ajustarOcorrencias(List<Long> ocorrenciaIds) {
        Uni<Void> chain = Uni.createFrom().voidItem();
        for (Long ocoId : ocorrenciaIds) {
            chain = chain.chain(() -> ajustarOcorrencia(ocoId));
        }
        return chain;
    }

    private Uni<Void> ajustarOcorrencia(Long ocoId) {
        return buscarOcorrenciaOferecimento(ocoId).chain(od -> {
            if (od.oferecimentoId() == null) {
                return Uni.createFrom().voidItem();
            }
            return contarCadernos(ocoId).chain(total -> {
                Uni<Void> acao;
                if (total == null || total == 0) {
                    acao = deleteOcorrencia(ocoId);
                } else {
                    acao = marcarCadernoRemovido(ocoId).chain(() -> desativarOcorrencia(ocoId));
                }
                return acao
                        .chain(() -> ajutarOferecimento(od.oferecimentoId(), od.diaAulaId()))
                        .chain(() -> atualizaDataOferecimento(od.oferecimentoId()));
            });
        });
    }

    private Uni<Void> ajutarOferecimento(Long oferecimentoId, Long diaAulaId) {
        if (oferecimentoId == null || diaAulaId == null) {
            return Uni.createFrom().voidItem();
        }
        return buscarOferecimento(oferecimentoId).chain(of -> {
            if (of == null) {
                return Uni.createFrom().voidItem();
            }
            Uni<Long> tipoCurso = buscarTipoCurso(of.idCurso());
            Uni<Integer> diaSemana = buscarDiaSemana(diaAulaId);
            Uni<CriterioRow> criterio = buscarCriterio(of.idCurso(), of.idUnidade());
            return Uni.combine().all().unis(tipoCurso, diaSemana, criterio).asTuple()
                    .chain(t -> encontrarProximoDiaAula(of, t.getItem2(), t.getItem1(), t.getItem3()))
                    .chain(novaData -> {
                        if (novaData == null) {
                            return Uni.createFrom().voidItem();
                        }
                        return buscarTurno(diaAulaId).chain(turno -> {
                            Uni<List<ConflitoRow>> conflitos = turno == null
                                    ? Uni.createFrom().item(List.of())
                                    : buscarConflitos(novaData, of.idSala(), of.idUnidade());
                            return conflitos.chain(confl -> inserirOcorrencia(oferecimentoId, of.idSala(), of.idProfessor(), novaData, diaAulaId)
                                    .chain(novaOcoId -> recalcularDatas(oferecimentoId)
                                            .chain(datas -> atualizarDatas(oferecimentoId, datas)
                                                    .chain(() -> inserirCaderno(oferecimentoId))
                                                    .chain(() -> processarConflitos(confl, turno)))));
                        });
                    });
        });
    }

    private Uni<LocalDate> encontrarProximoDiaAula(OferecimentoRow of, Integer diaSemanaId, Long tipoCursoId, CriterioRow criterio) {
        LocalDate inicio = of.dataFim() == null ? LocalDate.now() : of.dataFim().plusDays(1);
        return percorrerDias(inicio, of, diaSemanaId, tipoCursoId, criterio, 0);
    }

    private Uni<LocalDate> percorrerDias(LocalDate data, OferecimentoRow of, Integer diaSemanaId,
                                         Long tipoCursoId, CriterioRow criterio, int tentativas) {
        if (tentativas >= MAX_DIAS_BUSCA || diaSemanaId == null) {
            return Uni.createFrom().nullItem();
        }
        if (diaSemanaDe(data) != diaSemanaId) {
            return percorrerDias(data.plusDays(1), of, diaSemanaId, tipoCursoId, criterio, tentativas + 1);
        }
        return verificarFeriado(data, of.idUnidade(), tipoCursoId).chain(totalFeriados -> {
            boolean criterioDefinido = criterio != null && criterio.dataFim() != null
                    && criterio.dataInicio() != null && criterio.dataInicio().isAfter(data);
            if ((totalFeriados != null && totalFeriados > 0) || criterioDefinido) {
                return percorrerDias(data.plusDays(1), of, diaSemanaId, tipoCursoId, criterio, tentativas + 1);
            }
            return Uni.createFrom().item(data);
        });
    }

    private Uni<Void> processarConflitos(List<ConflitoRow> conflitos, TurnoRow turno) {
        if (turno == null) {
            return Uni.createFrom().voidItem();
        }
        Uni<Void> chain = Uni.createFrom().voidItem();
        for (ConflitoRow c : conflitos) {
            if (temSobreposicao(turno, c)) {
                chain = chain.chain(() -> tratarConflito(c));
            }
        }
        return chain;
    }

    private boolean temSobreposicao(TurnoRow novo, ConflitoRow c) {
        if (novo.inicio() == null || novo.fim() == null || c.inicio() == null || c.fim() == null) {
            return false;
        }
        return (novo.inicio().isBefore(c.fim()) && novo.fim().isAfter(c.inicio()))
                || (c.inicio().isBefore(novo.fim()) && c.fim().isAfter(novo.inicio()));
    }

    private Uni<Void> tratarConflito(ConflitoRow c) {
        return marcarCadernoConflitoRemovido(c.idOcorrencia()).chain(linhas -> {
            Uni<Void> acao = linhas == 0 ? deleteOcorrencia(c.idOcorrencia()) : desativarOcorrencia(c.idOcorrencia());
            return acao.chain(() -> ajutarOferecimento(c.idOferecimento(), c.idDiaAula()));
        });
    }

    private Uni<Void> atualizaDataOferecimento(Long oferecimentoId) {
        return recalcularDatas(oferecimentoId)
                .chain(datas -> atualizarDatas(oferecimentoId, datas))
                .chain(() -> pool.preparedQuery(SQL_ATUALIZAR_STATUS_OFERECIMENTO)
                        .execute(Tuple.of(oferecimentoId)).replaceWithVoid());
    }

    // -----------------------------------------------------------------------------------------
    // Helpers de acesso ao banco
    // -----------------------------------------------------------------------------------------

    private Uni<String> buscarConfigValor() {
        return pool.preparedQuery(SQL_CONFIG).execute(Tuple.of(CHAVE_CONFIG))
                .map(rows -> rows.iterator().hasNext() ? rows.iterator().next().getString("valor") : null);
    }

    private Uni<Void> atualizarConfigValor(String valor) {
        return pool.preparedQuery(SQL_UPDATE_CONFIG).execute(Tuple.of(valor, CHAVE_CONFIG)).replaceWithVoid();
    }

    private Uni<List<FeriadoAjusteItem>> buscarAjustesAtivos() {
        return pool.query(SQL_BUSCAR_AJUSTES_ATIVOS).execute().map(rows -> {
            List<FeriadoAjusteItem> lista = new ArrayList<>();
            for (Row row : rows) {
                lista.add(new FeriadoAjusteItem(row.getLong("id"), row.getLong("id_feriado"), row.getBoolean("fl_ocorrencia")));
            }
            return lista;
        });
    }

    private Uni<List<FeriadoAjusteItem>> buscarAjustesAtivosApos(Long id) {
        return pool.preparedQuery(SQL_BUSCAR_AJUSTES_ATIVOS_APOS).execute(Tuple.of(id)).map(rows -> {
            List<FeriadoAjusteItem> lista = new ArrayList<>();
            for (Row row : rows) {
                lista.add(new FeriadoAjusteItem(row.getLong("id"), row.getLong("id_feriado"), row.getBoolean("fl_ocorrencia")));
            }
            return lista;
        });
    }

    private Uni<FeriadoRow> buscarFeriadoComUnidades(Long feriadoId) {
        if (feriadoId == null) {
            return Uni.createFrom().item(new FeriadoRow(null, List.of()));
        }
        return pool.preparedQuery(SQL_FERIADO_DATA).execute(Tuple.of(feriadoId)).chain(rows -> {
            if (!rows.iterator().hasNext()) {
                return Uni.createFrom().item(new FeriadoRow(null, List.of()));
            }
            LocalDate data = rows.iterator().next().getLocalDate("dt_feriado");
            return pool.preparedQuery(SQL_FERIADO_UNIDADES).execute(Tuple.of(feriadoId)).map(r -> {
                List<Long> unidades = new ArrayList<>();
                for (Row row : r) {
                    unidades.add(row.getLong("id_unidade"));
                }
                return new FeriadoRow(data, unidades);
            });
        });
    }

    private Uni<List<Long>> buscarOcorrenciasPorDataUnidade(LocalDate data, List<Long> unidades) {
        if (data == null || unidades == null || unidades.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        StringJoiner placeholders = new StringJoiner(", ");
        for (int i = 0; i < unidades.size(); i++) {
            placeholders.add("$" + (i + 2));
        }
        String sql = "SELECT o.id FROM edc_ocorrencia_componente_curricular o " +
                "JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular " +
                "WHERE o.fl_ativo = true AND o.data = $1 AND ofe.id_unidade IN (" + placeholders + ") ORDER BY ofe.id";
        Tuple tuple = Tuple.of(data);
        unidades.forEach(tuple::addLong);
        return pool.preparedQuery(sql).execute(tuple).map(rows -> {
            List<Long> ids = new ArrayList<>();
            for (Row row : rows) {
                ids.add(row.getLong("id"));
            }
            return ids;
        });
    }

    private Uni<List<Long>> buscarIdsAjustar(Long ajusteId) {
        return pool.preparedQuery(SQL_AJUSTAR_IDS).execute(Tuple.of(ajusteId.intValue())).map(rows -> {
            List<Long> ids = new ArrayList<>();
            for (Row row : rows) {
                ids.add(row.getLong("id_ocorrencia_componente_curricular"));
            }
            return ids;
        });
    }

    private Uni<List<Long>> buscarIdsNaoAjustar(Long ajusteId) {
        return pool.preparedQuery(SQL_NAO_AJUSTAR_IDS).execute(Tuple.of(ajusteId.intValue())).map(rows -> {
            List<Long> ids = new ArrayList<>();
            for (Row row : rows) {
                ids.add(row.getLong("id_ocorrencia_componente_curricular"));
            }
            return ids;
        });
    }

    private Uni<Void> desativarAjuste(Long ajusteId) {
        return pool.preparedQuery(SQL_DESATIVAR_AJUSTE).execute(Tuple.of(ajusteId)).replaceWithVoid();
    }

    private Uni<OferDiaRow> buscarOcorrenciaOferecimento(Long ocoId) {
        return pool.preparedQuery(SQL_OCORRENCIA_OFERECIMENTO).execute(Tuple.of(ocoId)).map(rows -> {
            if (!rows.iterator().hasNext()) {
                return new OferDiaRow(null, null);
            }
            Row row = rows.iterator().next();
            return new OferDiaRow(row.getLong("id_oferecimento_componente_curricular"), row.getLong("id_dia_aula"));
        });
    }

    private Uni<Long> contarCadernos(Long ocoId) {
        return pool.preparedQuery(SQL_CONTAR_CADERNOS).execute(Tuple.of(ocoId))
                .map(rows -> rows.iterator().hasNext() ? rows.iterator().next().getLong("total") : 0L);
    }

    private Uni<Void> marcarCadernoRemovido(Long ocoId) {
        return pool.preparedQuery(SQL_MARCAR_CADERNO_REMOVIDO).execute(Tuple.of(ocoId)).replaceWithVoid();
    }

    private Uni<Void> deleteOcorrencia(Long ocoId) {
        return pool.preparedQuery(SQL_DELETE_OCORRENCIA).execute(Tuple.of(ocoId)).replaceWithVoid();
    }

    private Uni<Void> desativarOcorrencia(Long ocoId) {
        return pool.preparedQuery(SQL_DESATIVAR_OCORRENCIA).execute(Tuple.of(ocoId)).replaceWithVoid();
    }

    private Uni<OferecimentoRow> buscarOferecimento(Long oferecimentoId) {
        return pool.preparedQuery(SQL_OFERECIMENTO).execute(Tuple.of(oferecimentoId)).map(rows -> {
            if (!rows.iterator().hasNext()) {
                return null;
            }
            Row r = rows.iterator().next();
            return new OferecimentoRow(r.getLong("id_unidade"), r.getLong("id_sala"), r.getLong("id_professor"),
                    r.getLong("id_curso"), r.getLocalDate("data_inicio"), r.getLocalDate("data_fim"));
        });
    }

    private Uni<Long> buscarTipoCurso(Long idCurso) {
        if (idCurso == null) {
            return Uni.createFrom().nullItem();
        }
        return pool.preparedQuery(SQL_TIPO_CURSO).execute(Tuple.of(idCurso))
                .map(rows -> rows.iterator().hasNext() ? rows.iterator().next().getLong("id_tipo_curso") : null);
    }

    private Uni<Integer> buscarDiaSemana(Long diaAulaId) {
        return pool.preparedQuery(SQL_DIA_AULA).execute(Tuple.of(diaAulaId))
                .map(rows -> rows.iterator().hasNext() ? rows.iterator().next().getInteger("id_dia_semana") : null);
    }

    private Uni<CriterioRow> buscarCriterio(Long idCurso, Long idUnidade) {
        if (idCurso == null || idUnidade == null) {
            return Uni.createFrom().nullItem();
        }
        return pool.preparedQuery(SQL_CRITERIO).execute(Tuple.of(idCurso, idUnidade)).map(rows -> {
            if (!rows.iterator().hasNext()) {
                return null;
            }
            Row r = rows.iterator().next();
            return new CriterioRow(r.getLocalDate("data_inicio"), r.getLocalDate("data_fim"));
        });
    }

    private Uni<Long> verificarFeriado(LocalDate data, Long unidadeId, Long tipoCursoId) {
        return pool.preparedQuery(SQL_VERIFICAR_FERIADO).execute(Tuple.of(unidadeId, data, tipoCursoId))
                .map(rows -> rows.iterator().hasNext() ? rows.iterator().next().getLong("total") : 0L);
    }

    private Uni<Long> inserirOcorrencia(Long oferecimentoId, Long salaId, Long professorId, LocalDate data, Long diaAulaId) {
        return pool.preparedQuery(SQL_INSERIR_OCORRENCIA)
                .execute(Tuple.of(oferecimentoId, salaId, professorId, data, diaAulaId))
                .map(rows -> rows.iterator().next().getLong("id"));
    }

    private Uni<DatasRow> recalcularDatas(Long oferecimentoId) {
        return pool.preparedQuery(SQL_RECALCULAR_DATAS).execute(Tuple.of(oferecimentoId)).map(rows -> {
            if (!rows.iterator().hasNext()) {
                return new DatasRow(null, null);
            }
            Row r = rows.iterator().next();
            return new DatasRow(r.getLocalDate("inicio"), r.getLocalDate("fim"));
        });
    }

    private Uni<Void> atualizarDatas(Long oferecimentoId, DatasRow datas) {
        if (datas.inicio() == null && datas.fim() == null) {
            return Uni.createFrom().voidItem();
        }
        return pool.preparedQuery(SQL_ATUALIZAR_DATAS)
                .execute(Tuple.of(oferecimentoId, datas.inicio(), datas.fim())).replaceWithVoid();
    }

    private Uni<Void> inserirCaderno(Long oferecimentoId) {
        return pool.preparedQuery(SQL_INSERIR_CADERNO).execute(Tuple.of(oferecimentoId)).replaceWithVoid();
    }

    private Uni<TurnoRow> buscarTurno(Long diaAulaId) {
        return pool.preparedQuery(SQL_TURNO).execute(Tuple.of(diaAulaId)).map(rows -> {
            if (!rows.iterator().hasNext()) {
                return null;
            }
            Row r = rows.iterator().next();
            return new TurnoRow(r.getLocalTime("inicio"), r.getLocalTime("fim"));
        });
    }

    private Uni<List<ConflitoRow>> buscarConflitos(LocalDate data, Long salaId, Long unidadeId) {
        return pool.preparedQuery(SQL_CONFLITOS).execute(Tuple.of(data, salaId, unidadeId)).map(rows -> {
            List<ConflitoRow> lista = new ArrayList<>();
            for (Row r : rows) {
                lista.add(new ConflitoRow(r.getLong("id"), r.getLong("id_dia_aula"),
                        r.getLocalTime("inicio"), r.getLocalTime("fim"), r.getLong("id_oferecimento")));
            }
            return lista;
        });
    }

    private Uni<Integer> marcarCadernoConflitoRemovido(Long ocoId) {
        return pool.preparedQuery(SQL_CONFLITO_CADERNO).execute(Tuple.of(ocoId)).map(rows -> rows.rowCount());
    }

    private static int diaSemanaDe(LocalDate data) {
        return (data.getDayOfWeek().getValue() % 7) + 1;
    }
}
