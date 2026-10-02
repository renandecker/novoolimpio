package br.com.sol7.olimpio.basico.feriado.repository;

import java.util.Date;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.feriado.entity.Feriado;

@ApplicationScoped
public class FeriadoRepository implements PanacheRepository<Feriado> {


    public static final String SQL_IDS_FERIADO_FIXO =
            "SELECT id FROM bas_feriado WHERE fl_feriado_fixo = true ORDER BY id";

    public Uni<java.util.List<Long>> idsFeriadosFixos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_IDS_FERIADO_FIXO)
                        .getResultList()
                        .map(rows -> rows.stream()
                                .map(row -> ((Number) row).longValue())
                                .toList()));
    }

    public static final String SQL_UNIDADES_FERIADO =
            "SELECT id_unidade FROM bas_feriado_unidade WHERE id_feriado = :feriado";

    public Uni<java.util.List<Long>> unidadesDoFeriado(Long feriadoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_UNIDADES_FERIADO)
                        .setParameter("feriado", feriadoId)
                        .getResultList()
                        .map(rows -> rows.stream()
                                .map(row -> ((Number) row).longValue())
                                .toList()));
    }

    public static final String SQL_TIPOS_CURSO_FERIADO =
            "SELECT id_tipo_curso FROM bas_feriado_tipo_curso WHERE id_feriado = :feriado";

    public Uni<java.util.List<Long>> tiposCursoDoFeriado(Long feriadoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TIPOS_CURSO_FERIADO)
                        .setParameter("feriado", feriadoId)
                        .getResultList()
                        .map(rows -> rows.stream()
                                .map(row -> ((Number) row).longValue())
                                .toList()));
    }

    public static final String SQL_INSERT_UNIDADE_FERIADO =
            "INSERT INTO bas_feriado_unidade (id_feriado, id_unidade) VALUES (:feriado, :unidade)";

    public Uni<Void> vincularUnidade(Long feriadoId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_INSERT_UNIDADE_FERIADO)
                        .setParameter("feriado", feriadoId)
                        .setParameter("unidade", unidadeId)
                        .executeUpdate())
                .replaceWithVoid();
    }

    public static final String SQL_INSERT_TIPO_CURSO_FERIADO =
            "INSERT INTO bas_feriado_tipo_curso (id_feriado, id_tipo_curso) VALUES (:feriado, :tipoCurso)";

    public Uni<Void> vincularTipoCurso(Long feriadoId, Long tipoCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_INSERT_TIPO_CURSO_FERIADO)
                        .setParameter("feriado", feriadoId)
                        .setParameter("tipoCurso", tipoCursoId)
                        .executeUpdate())
                .replaceWithVoid();
    }


    // -------------------------------------------------------------------------
    // Migrado de FeriadoService.atualizarOferecimento (legado) - parte que e
    // possivel expressar em SQL sobre as tabelas edc_*
    // -------------------------------------------------------------------------
    public static final String SQL_CONTAR_CADERNO =
            "SELECT count(*) FROM edc_caderno_componente_curricular WHERE id_ocorrencia_componente_curricular = :id";

    public Uni<Long> contarCaderno(Long ocorrenciaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CONTAR_CADERNO)
                        .setParameter("id", ocorrenciaId)
                        .getResultList()
                        .map(rows -> ((Number) rows.get(0)).longValue()));
    }

    public static final String SQL_ATUALIZAR_PRESENCA_CADERNO =
            "UPDATE edc_caderno_componente_curricular SET presenca = 'r', data_alteracao = now() "
                    + "WHERE presenca != 'i' and presenca != 'c' and presenca != 'v' "
                    + "and id_ocorrencia_componente_curricular = :id";

    public Uni<Void> atualizarPresencaCaderno(Long ocorrenciaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZAR_PRESENCA_CADERNO)
                        .setParameter("id", ocorrenciaId)
                        .executeUpdate())
                .replaceWithVoid();
    }

    public static final String SQL_DESATIVAR_OCORRENCIA =
            "UPDATE edc_ocorrencia_componente_curricular SET fl_ativo = false WHERE id = :id";

    public Uni<Void> desativarOcorrencia(Long ocorrenciaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_DESATIVAR_OCORRENCIA)
                        .setParameter("id", ocorrenciaId)
                        .executeUpdate())
                .replaceWithVoid();
    }

    public static final String SQL_OFERECIMENTO_DA_OCORRENCIA =
            "SELECT id_oferecimento_componente_curricular FROM edc_ocorrencia_componente_curricular WHERE id = :id";

    public Uni<Long> oferecimentoDaOcorrencia(Long ocorrenciaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_OFERECIMENTO_DA_OCORRENCIA)
                        .setParameter("id", ocorrenciaId)
                        .getResultList()
                        .map(rows -> rows.isEmpty() || rows.get(0) == null ? null : ((Number) rows.get(0)).longValue()));
    }

    public static final String SQL_ATUALIZAR_DATAS_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular o SET "
                    + " data_inicio = (select oco.data from edc_ocorrencia_componente_curricular oco "
                    + "   where oco.id_oferecimento_componente_curricular = o.id and oco.fl_ativo = true order by id limit 1),"
                    + " data_fim = (select oco.data from edc_ocorrencia_componente_curricular oco "
                    + "   where oco.id_oferecimento_componente_curricular = o.id and oco.fl_ativo = true order by id desc limit 1) "
                    + " where o.id = :id";

    public static final String SQL_ATUALIZAR_STATUS_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular o SET status = (case "
                    + " when o.data_cancelamento is not null then 'CANCELADA' "
                    + " when o.data_inicio > current_date and o.vagas <= o.inscritos then 'LOTADA' "
                    + " when o.data_inicio > current_date then 'LIBERADA' "
                    + " when o.data_inicio < current_date and o.data_fim > current_date then 'EM_ANDAMENTO' "
                    + " when o.data_fim < current_date then 'FINALIZADA' "
                    + " else 'LIBERADA' end) "
                    + " where o.id = :id";

    public Uni<Void> atualizarDatasOferecimento(Long oferecimentoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZAR_DATAS_OFERECIMENTO)
                        .setParameter("id", oferecimentoId)
                        .executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_ATUALIZAR_STATUS_OFERECIMENTO)
                        .setParameter("id", oferecimentoId)
                        .executeUpdate())
                .replaceWithVoid();
    }


    // Select f from Feriado f left join f.unidade u left join f.tipoCurso t where  ((u IN (?1)) or f.nacional = true )  and f.dataFeriado = ?2 and (t IN (?3) or f.todosCursos = true)
    public static final String SQL_BUSCAR_FERIADO_UNIDADE =
            "SELECT f.* FROM bas_feriado f LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade LEFT JOIN bas_feriado_tipo_curso f_t_jt ON f_t_jt.id_feriado = f.id LEFT JOIN edc_tipo_curso t ON t.id = f_t_jt.id_tipo_curso WHERE ((u IN (?1)) or f.fl_nacional = true ) and f.dt_feriado = ?2 and (t IN (?3) or f.fl_tipo_curso = true)";

    public Uni<java.util.List<Feriado>> buscarFeriadoUnidade(Long unidadeId, Date data, Long tipoCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADO_UNIDADE, Feriado.class)
                        .setParameter(1, unidadeId)
                        .setParameter(2, data)
                        .setParameter(3, tipoCursoId)
                        .getResultList());
    }


    // Select distinct  f from Feriado f left join f.unidade u where  f.dataFeriado between ?1 and ?2
    public static final String SQL_BUSCAR_FERIADO_DA_UNIDADETIPO_CURSO =
            "SELECT DISTINCT f.* FROM bas_feriado f LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade WHERE f.dt_feriado between ?1 and ?2";

    public Uni<java.util.List<Feriado>> buscarFeriadoDaUnidadetipoCurso(Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADO_DA_UNIDADETIPO_CURSO, Feriado.class)
                        .setParameter(1, inicio)
                        .setParameter(2, fim)
                        .getResultList());
    }


    // Select distinct  f from Feriado f left join fetch f.unidade u where (u IN (?1) or f.nacional = true) and f.dataFeriado between ?2 and ?3
    public static final String SQL_BUSCAR_FERIADO_DA_UNIDADE =
            "SELECT DISTINCT f.* FROM bas_feriado f LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade WHERE (u IN (?1) or f.fl_nacional = true) and f.dt_feriado between ?2 and ?3";

    public Uni<java.util.List<Feriado>> buscarFeriadoDaUnidade(Long unidadeId, Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADO_DA_UNIDADE, Feriado.class)
                        .setParameter(1, unidadeId)
                        .setParameter(2, inicio)
                        .setParameter(3, fim)
                        .getResultList());
    }


    // Select distinct  f from Feriado f left join fetch f.unidade u where (u IN (?1) or f.nacional = true) and f.dataFeriado between ?2 and ?3
    public static final String SQL_BUSCAR_FERIADO_DA_UNIDADE_LIST =
            "SELECT DISTINCT f.* FROM bas_feriado f LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade WHERE (u IN (?1) or f.fl_nacional = true) and f.dt_feriado between ?2 and ?3";

    public Uni<java.util.List<Feriado>> buscarFeriadoDaUnidadeList(List<Long> unidadeIds, Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADO_DA_UNIDADE_LIST, Feriado.class)
                        .setParameter(1, unidadeIds)
                        .setParameter(2, inicio)
                        .setParameter(3, fim)
                        .getResultList());
    }


    // Select f from Feriado f left join fetch f.unidade u where f.feriadoFixo = true
    public static final String SQL_BUSCAR_FERIADO_FIXO =
            "SELECT f.* FROM bas_feriado f LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade WHERE f.fl_feriado_fixo = true";

    public Uni<java.util.List<Feriado>> buscarFeriadoFixo() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADO_FIXO, Feriado.class)

                        .getResultList());
    }


    // Select f from Feriado f where f.dataFeriado = ?1
    public static final String SQL_VERIFICAR_FERIADO_EXISTENTE =
            "SELECT f.* FROM bas_feriado f WHERE f.dt_feriado = ?1";

    public Uni<java.util.List<Feriado>> verificarFeriadoExistente(Date data) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_FERIADO_EXISTENTE, Feriado.class)
                        .setParameter(1, data)
                        .getResultList());
    }


    // Select f from Feriado f left join fetch f.unidade u where  f = ?1
    public static final String SQL_BUSCAR_FERIADO_COM_UNIDADES =
            "SELECT f.* FROM bas_feriado f LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade WHERE f.id = ?1";

    public Uni<java.util.List<Feriado>> buscarFeriadoComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADO_COM_UNIDADES, Feriado.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Select f from Feriado f left join fetch f.tipoCurso where f = ?1
    public static final String SQL_BUSCAR_FERIADO_COM_TIPO_CURSO =
            "SELECT f.* FROM bas_feriado f WHERE f.id = ?1";

    public Uni<java.util.List<Feriado>> buscarFeriadoComTipoCurso(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADO_COM_TIPO_CURSO, Feriado.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // unidades dos feriados de origem para o feriado de destino antes de removê-los.
    public static final String SQL_TROCAR_UNIDADE =
            "UPDATE bas_feriado_unidade SET id_feriado = :destino WHERE id_feriado = :origem";
    public static final String SQL_REMOVER_FERIADO =
            "DELETE FROM bas_feriado WHERE id = :origem";

    public Uni<Void> trocarFeriado(Long destinoId, Long origemId) {
        final String SQL_TROCAR_TIPO_CURSO =
                "UPDATE bas_feriado_tipo_curso SET id_feriado = :destino WHERE id_feriado = :origem";
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TROCAR_UNIDADE)
                        .setParameter("destino", destinoId)
                        .setParameter("origem", origemId)
                        .executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_TROCAR_TIPO_CURSO)
                        .setParameter("destino", destinoId)
                        .setParameter("origem", origemId)
                        .executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_REMOVER_FERIADO)
                        .setParameter("origem", origemId)
                        .executeUpdate())
                .replaceWithVoid();
    }


    // Select f from Feriado f left join f.unidade u left join f.tipoCurso tc where (u = (?1) or f.nacional = true) and f.dataFeriado = ?2 and tc is null
    public static final String SQL_BUSCAR_FERIADOS_COM_UNIDADE_DATA =
            "SELECT f.* FROM bas_feriado f LEFT JOIN bas_feriado_unidade f_u_jt ON f_u_jt.id_feriado = f.id LEFT JOIN bas_unidade u ON u.id = f_u_jt.id_unidade LEFT JOIN bas_feriado_tipo_curso f_tc_jt ON f_tc_jt.id_feriado = f.id LEFT JOIN edc_tipo_curso tc ON tc.id = f_tc_jt.id_tipo_curso WHERE (u.id = (?1) or f.fl_nacional = true) and f.dt_feriado = ?2 and tc is null";

    public Uni<java.util.List<Feriado>> buscarFeriadosComUnidadeData(Long unidadeId, Date inicio) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADOS_COM_UNIDADE_DATA, Feriado.class)
                        .setParameter(1, unidadeId)
                        .setParameter(2, inicio)
                        .getResultList());
    }

}