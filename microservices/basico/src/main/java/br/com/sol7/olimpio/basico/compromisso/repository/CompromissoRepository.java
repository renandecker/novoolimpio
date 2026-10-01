package br.com.sol7.olimpio.basico.compromisso.repository;

import java.util.Date;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.compromisso.entity.Compromisso;
import jakarta.persistence.Tuple;

@ApplicationScoped
public class CompromissoRepository implements PanacheRepository<Compromisso> {

    // Migrado de SchedulingService.atualizarCompromissosAutomaticos() (legado) - traduzido para
    // um unico UPDATE (o efeito final e o mesmo: troca o status do compromisso para o
    // "status de troca automatica" configurado). NAO cria o registro de auditoria
    // CompromissoPessoaStatus, pois essa feature ainda nao existe neste microsservico - ver
    // RELATORIO_SCHEDULE.md.
    public static final String SQL_ATUALIZAR_COMPROMISSOS_AUTOMATICOS =
            "UPDATE bas_compromisso a SET id_status_compromisso = sss.id_status_troca_auto, data_alteracao = now() " +
                    "FROM bas_status_compromisso sss " +
                    "WHERE sss.id = a.id_status_compromisso " +
                    "AND (a.data - cast((cast(sss.dias as text)||' day') as interval)) < current_date " +
                    "AND sss.dias <> 0 AND sss.trocaautomatomatica = true AND sss.id <> sss.id_status_troca_auto " +
                    "AND a.data::date <> current_date";

    public Uni<Void> atualizarCompromissosAutomaticos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZAR_COMPROMISSOS_AUTOMATICOS).executeUpdate())
                .replaceWithVoid();
    }

    // Select c from Compromisso c where c.statusCompromisso.trocaautomatomatica = true AND  current_date > cast(Date((c.data) - (c.statusCompromisso.dias)) as date) and  c.statusCompromisso.id <> c.statusCompromisso.statusCompromissoTrocaAuto.id
    public static final String SQL_BUSCAR_COMPROMISSO_AUTO =
            "SELECT c.* FROM bas_compromisso c LEFT JOIN bas_status_compromisso j_c_statusCompromisso ON j_c_statusCompromisso.id = c.id_status_compromisso LEFT JOIN bas_status_compromisso j_j_c_statusCompromisso_statusCompromissoTrocaAuto ON j_j_c_statusCompromisso_statusCompromissoTrocaAuto.id = j_c_statusCompromisso.id_status_troca_auto WHERE j_c_statusCompromisso.trocaautomatomatica = true AND current_date > cast(Date((c.data) - (j_c_statusCompromisso.dias)) as date) and j_c_statusCompromisso.id <> j_j_c_statusCompromisso_statusCompromissoTrocaAuto.id";

    public Uni<java.util.List<Compromisso>> buscarCompromissoAuto() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPROMISSO_AUTO, Compromisso.class)

                        .getResultList());
    }


    // Select c from Compromisso c left join fetch c.resultados r where c.id = ?1
    public static final String SQL_BUSCAR_COMPROMISSO_COM_RESULTADOS =
            "SELECT c.* FROM bas_compromisso c LEFT JOIN bas_compromisso_resultado c_r_jt ON c_r_jt.id_compromisso = c.id LEFT JOIN bas_resultado r ON r.id = c_r_jt.id_resultado WHERE c.id = ?1";

    public Uni<java.util.List<Compromisso>> buscarCompromissoComResultados(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPROMISSO_COM_RESULTADOS, Compromisso.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // Select c from Compromisso c left join fetch c.statusCompromisso inner join c.horario h where c.agenda = ?1 AND c.data = ?2 and c.statusCompromisso.id = ?3 order by h.hora
    public static final String SQL_LISTAR_COMPROMISSOS_COM_AGENDA_COM_STATUS =
            "SELECT c.* FROM bas_compromisso c LEFT JOIN bas_status_compromisso inner ON inner.id = c.id_status_compromisso INNER JOIN bas_horario h ON h.id = c.id_horario LEFT JOIN bas_status_compromisso j_c_statusCompromisso ON j_c_statusCompromisso.id = c.id_status_compromisso WHERE c.id_agenda = ?1 AND c.data = ?2 and j_c_statusCompromisso.id = ?3 ORDER BY h.hora";

    public Uni<java.util.List<Compromisso>> listarCompromissosComAgendaComStatus(Long agendaId, Date data, int status) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_COMPROMISSOS_COM_AGENDA_COM_STATUS, Compromisso.class)
                        .setParameter(1, agendaId)
                        .setParameter(2, data)
                        .setParameter(3, status)
                        .getResultList());
    }


    // Select c from Compromisso c  left join fetch c.statusCompromisso inner join c.horario h where c.agenda = ?1 AND c.data = ?2 order by h.hora
    public static final String SQL_LISTAR_COMPROMISSOS_COM_AGENDA =
            "SELECT c.* FROM bas_compromisso c LEFT JOIN bas_status_compromisso inner ON inner.id = c.id_status_compromisso INNER JOIN bas_horario h ON h.id = c.id_horario WHERE c.id_agenda = ?1 AND c.data = ?2 ORDER BY h.hora";

    public Uni<java.util.List<Compromisso>> listarCompromissosComAgenda(Long agendaId, Date data) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_COMPROMISSOS_COM_AGENDA, Compromisso.class)
                        .setParameter(1, agendaId)
                        .setParameter(2, data)
                        .getResultList());
    }


    // Select c from Compromisso c where c.prospecto = ?1
    public static final String SQL_LISTAR_COMPROMISSOS_PELO_PROSPECTO =
            "SELECT c.* FROM bas_compromisso c WHERE c.id_prospecto = ?1";

// Nova query para listar compromissos por range de data
    public static final String SQL_LISTAR_COMPROMISSOS_POR_RANGE_DATA =
            "SELECT c.* FROM bas_compromisso c LEFT JOIN bas_status_compromisso inner ON inner.id = c.id_status_compromisso LEFT JOIN bas_horario h ON h.id = c.id_horario WHERE c.data >= ?1 AND c.data <= ?2";

    public Uni<java.util.List<Compromisso>> listarCompromissosPorRangeData(Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_COMPROMISSOS_POR_RANGE_DATA, Compromisso.class)
                        .setParameter(1, inicio)
                        .setParameter(2, fim)
                        .getResultList());
    }

    public Uni<java.util.List<Compromisso>> listarCompromissosPeloProspecto(Long prospectoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_COMPROMISSOS_PELO_PROSPECTO, Compromisso.class)
                        .setParameter(1, prospectoId)
                        .getResultList());
    }


    // Update Compromisso c set c.statusCompromisso = ?2 where c = ?1
    // Correcao: SQL nativo valido (removido o alias 'c.') + data_alteracao = now().
    public static final String SQL_MODIFICAR_STATUS_COMPROMISSO =
            "UPDATE bas_compromisso SET id_status_compromisso = ?2, data_alteracao = now() WHERE id = ?1";

    public Uni<Integer> modificarStatusCompromisso(Long compromissoId, Long statusId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MODIFICAR_STATUS_COMPROMISSO)
                        .setParameter(1, compromissoId)
                        .setParameter(2, statusId)
                        .executeUpdate());
    }

    // Busca o id do proximo status (bas_status_compromisso.id_prox_status_compromisso) do compromisso.
    public static final String SQL_BUSCAR_PROXIMO_STATUS =
            "SELECT s.id_prox_status_compromisso FROM bas_compromisso c JOIN bas_status_compromisso s ON s.id = c.id_status_compromisso WHERE c.id = ?1";

    public Uni<Long> buscarProximoStatus(Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PROXIMO_STATUS)
                        .setParameter(1, compromissoId)
                        .getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null ? null : ((Number) list.get(0)).longValue());
    }

    // Busca o id_status_compromisso da agenda do compromisso (para decidir se seta data_chegada).
    public static final String SQL_BUSCAR_STATUS_AGENDA =
            "SELECT a.id_status_compromisso FROM bas_compromisso c JOIN bas_agenda a ON a.id = c.id_agenda WHERE c.id = ?1";

    public Uni<Long> buscarStatusAgenda(Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_STATUS_AGENDA)
                        .setParameter(1, compromissoId)
                        .getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null ? null : ((Number) list.get(0)).longValue());
    }

    // Registra o historico de mudanca de status (bas_compromisso_pessoa_status).
    public static final String SQL_INSERIR_PESSOA_STATUS =
            "INSERT INTO bas_compromisso_pessoa_status (id_compromisso, id_status_anterior, id_status_proximo, data) VALUES (?1, ?2, ?3, current_date)";

    public Uni<Integer> inserirPessoaStatus(Long compromissoId, Long statusAnteriorId, Long statusProximoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_INSERIR_PESSOA_STATUS)
                        .setParameter(1, compromissoId)
                        .setParameter(2, statusAnteriorId)
                        .setParameter(3, statusProximoId)
                        .executeUpdate());
    }

    // Avanca o compromisso para o proximo status (data_chegada quando o status da agenda for atingido).
    public static final String SQL_AVANCAR_STATUS =
            "UPDATE bas_compromisso SET id_status_compromisso = ?2, data_alteracao = now(), " +
                    "data_chegada = CASE WHEN ?3 THEN now() ELSE data_chegada END, " +
                    "observacao = COALESCE(?4, observacao) WHERE id = ?1";

    public Uni<Integer> avancarStatus(Long compromissoId, Long proximoStatusId, boolean dataChegada, String observacao) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AVANCAR_STATUS)
                        .setParameter(1, compromissoId)
                        .setParameter(2, proximoStatusId)
                        .setParameter(3, dataChegada)
                        .setParameter(4, observacao)
                        .executeUpdate());
    }

    // Fechar compromisso (ativo = false).
    public static final String SQL_FECHAR_COMPROMISSO =
            "UPDATE bas_compromisso SET ativo = false, data_alteracao = now() WHERE id = ?1";

    public Uni<Integer> fecharCompromisso(Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FECHAR_COMPROMISSO)
                        .setParameter(1, compromissoId)
                        .executeUpdate());
    }

    // Lista os resultados (id + descricao) vinculados ao compromisso, para a acao "Ver resultados".
    public static final String SQL_BUSCAR_RESULTADOS_DO_COMPROMISSO =
            "SELECT r.id, r.descricao FROM bas_compromisso_resultado cr JOIN bas_resultado r ON r.id = cr.id_resultado WHERE cr.id_compromisso = ?1 ORDER BY r.descricao";

    public Uni<List<Tuple>> buscarResultadosDoCompromisso(Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_RESULTADOS_DO_COMPROMISSO, Tuple.class)
                        .setParameter(1, compromissoId)
                        .getResultList())
                .map(list -> list.stream().map(row -> (Tuple) row).toList());
    }


    // Select c.prospecto from Compromisso c left join fetch c.prospecto.prospectoCampos where c=?1
    public static final String SQL_BUSCAR_PROSPECTO_DO_COMPROMISSO =
            "SELECT c.id_prospecto FROM bas_compromisso c WHERE c.id=?1";

    public Uni<java.util.List<Object>> buscarProspectoDoCompromisso(Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PROSPECTO_DO_COMPROMISSO)
                        .setParameter(1, compromissoId)
                        .getResultList());
    }


    // select l from Ligacao l where l.compromisso = ?1
    public static final String SQL_BUSCAR_LIGACAO_AGENDAMENTO_VENCIDO =
            "SELECT l.* FROM cen_ligacao l WHERE l.id_compromisso = ?1";

    // Atencao: a query original seleciona 'Ligacao', nao 'Compromisso'.
    // Se 'Ligacao' existir como entidade neste microsservico, troque Object por Ligacao.class abaixo.
    public Uni<java.util.List<Object>> buscarLigacaoAgendamentoVencido(Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_LIGACAO_AGENDAMENTO_VENCIDO)
                        .setParameter(1, compromissoId)
                        .getResultList());
    }

}