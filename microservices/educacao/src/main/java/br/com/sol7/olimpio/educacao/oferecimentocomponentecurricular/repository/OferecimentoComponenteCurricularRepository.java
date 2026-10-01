package br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Tuple;

import br.com.sol7.olimpio.educacao.diaaula.DiaAula;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class OferecimentoComponenteCurricularRepository implements PanacheRepository<OferecimentoComponenteCurricular> {

    // select m from MatrizCurricular m where m.curriculo = ?1 order by m.ordem
    public static final String SQL_BUSCAR_MATRIZ_CURRICULAR =
            "SELECT m.id AS id FROM edc_matriz_curricular m WHERE m.id_curriculo = ?1 ORDER BY m.ordem";

    // Atencao: a query original seleciona 'MatrizCurricular', nao 'OferecimentoComponenteCurricular'.
    // Se 'MatrizCurricular' existir como entidade neste microsservico, troque Object por MatrizCurricular.class abaixo.
    public Uni<java.util.List<Tuple>> buscarMatrizCurricular(Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MATRIZ_CURRICULAR, Tuple.class)
                        .setParameter(1, curriculoId)
                        .getResultList());
    }


    // select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and off.grupo = ?2 and off.curriculo = ?3 and off.status <> 'CANCELADA' and   (lower(off.componenteCurricular.descricao) like '%' || ?1 || '%'  OR str(off.id) = ?1 or lower(off.componenteCurricular.sucinto) like '%' || ?1 || '%')
    public static final String SQL_AUTOCOMPLETE_COM_CURRICULO_GRUPO_COM_QUERY =
            "SELECT DISTINCT off.id_componente_curricular FROM edc_oferecimento_componente_curricular off LEFT JOIN bas_unidade j_off_unidade ON j_off_unidade.id = off.id_unidade LEFT JOIN edc_componente_curricular j_off_componenteCurricular ON j_off_componenteCurricular.id = off.id_componente_curricular WHERE j_off_unidade.fl_ativo = true and off.id_grupo = ?2 and off.id_curso = ?3 and off.status <> 'CANCELADA' and (lower(j_off_componenteCurricular.descricao) like '%' || ?1 || '%' OR CAST(off.id AS text) = ?1 or lower(j_off_componenteCurricular.sucinto) like '%' || ?1 || '%') LIMIT 10";

    public Uni<java.util.List<Object>> autocompleteComCurriculoGrupoComQuery(String query, Long grupoId, Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE_COM_CURRICULO_GRUPO_COM_QUERY)
                        .setParameter(1, query)
                        .setParameter(2, grupoId)
                        .setParameter(3, curriculoId)
                        .getResultList());
    }


    // select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and  off.grupo = ?1 and off.curriculo = ?2 and off.status <> 'CANCELADA'
    public static final String SQL_AUTOCOMPLETE_COM_CURRICULO_GRUPO_SEM_QUERY =
            "SELECT DISTINCT off.id_componente_curricular FROM edc_oferecimento_componente_curricular off LEFT JOIN bas_unidade j_off_unidade ON j_off_unidade.id = off.id_unidade WHERE j_off_unidade.fl_ativo = true and off.id_grupo = ?1 and off.id_curso = ?2 and off.status <> 'CANCELADA' LIMIT 10";

    public Uni<java.util.List<Object>> autocompleteComCurriculoGrupoSemQuery(Long grupoId, Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE_COM_CURRICULO_GRUPO_SEM_QUERY)
                        .setParameter(1, grupoId)
                        .setParameter(2, curriculoId)
                        .getResultList());
    }


    // select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and  off.curriculo = ?2 and off.status <> 'CANCELADA' and   (lower(off.componenteCurricular.descricao) like '%' || ?1 || '%'  OR str(off.id) = ?1 or lower(off.componenteCurricular.sucinto) like '%' || ?1 || '%')
    public static final String SQL_AUTOCOMPLETE_COM_CURRICULO_COM_QUERY =
            "SELECT DISTINCT off.id_componente_curricular FROM edc_oferecimento_componente_curricular off LEFT JOIN bas_unidade j_off_unidade ON j_off_unidade.id = off.id_unidade LEFT JOIN edc_componente_curricular j_off_componenteCurricular ON j_off_componenteCurricular.id = off.id_componente_curricular WHERE j_off_unidade.fl_ativo = true and off.id_curso = ?2 and off.status <> 'CANCELADA' and (lower(j_off_componenteCurricular.descricao) like '%' || ?1 || '%' OR CAST(off.id AS text) = ?1 or lower(j_off_componenteCurricular.sucinto) like '%' || ?1 || '%') LIMIT 10";

    public Uni<java.util.List<Object>> autocompleteComCurriculoComQuery(String query, Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE_COM_CURRICULO_COM_QUERY)
                        .setParameter(1, query)
                        .setParameter(2, curriculoId)
                        .getResultList());
    }


    // select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and off.curriculo = ?1 and off.status <> 'CANCELADA'
    public static final String SQL_AUTOCOMPLETE_COM_CURRICULO_SEM_QUERY =
            "SELECT DISTINCT off.id_componente_curricular FROM edc_oferecimento_componente_curricular off LEFT JOIN bas_unidade j_off_unidade ON j_off_unidade.id = off.id_unidade WHERE j_off_unidade.fl_ativo = true and off.id_curso = ?1 and off.status <> 'CANCELADA' LIMIT 10";

    public Uni<java.util.List<Object>> autocompleteComCurriculoSemQuery(Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE_COM_CURRICULO_SEM_QUERY)
                        .setParameter(1, curriculoId)
                        .getResultList());
    }


    // select m from OferecimentoComponenteCurricular m where m.unidade.ativo = true order by m.id
    public static final String SQL_TODOS =
            "SELECT m.* FROM edc_oferecimento_componente_curricular m LEFT JOIN bas_unidade j_m_unidade ON j_m_unidade.id = m.id_unidade WHERE j_m_unidade.fl_ativo = true ORDER BY m.id";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> todos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TODOS, OferecimentoComponenteCurricular.class)

                        .getResultList());
    }


    // select o from OcorrenciaComponenteCurricular o where o.oferecimentoComponenteCurricular.unidade.ativo = true and o.ativo = true and o.data = ?1 AND o.sala = ?2 and o.oferecimentoComponenteCurricular.unidade = ?3
    public static final String SQL_VERIFICAR_EXISTE_CONFLITO =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o LEFT JOIN edc_oferecimento_componente_curricular j_o_oferecimentoComponenteCurricular ON j_o_oferecimentoComponenteCurricular.id = o.id_oferecimento_componente_curricular LEFT JOIN bas_unidade j_j_o_oferecimentoComponenteCurricular_unidade ON j_j_o_oferecimentoComponenteCurricular_unidade.id = j_o_oferecimentoComponenteCurricular.id_unidade WHERE j_j_o_oferecimentoComponenteCurricular_unidade.fl_ativo = true and o.fl_ativo = true and o.data = ?1 AND o.id_sala = ?2 and j_o_oferecimentoComponenteCurricular.id_unidade = ?3";

    // Atencao: a query original seleciona 'OcorrenciaComponenteCurricular', nao 'OferecimentoComponenteCurricular'.
    // Se 'OcorrenciaComponenteCurricular' existir como entidade neste microsservico, troque Object por OcorrenciaComponenteCurricular.class abaixo.
    public Uni<java.util.List<Object>> verificarExisteConflito(Date data, Long salaId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_EXISTE_CONFLITO)
                        .setParameter(1, data)
                        .setParameter(2, salaId)
                        .setParameter(3, unidadeId)
                        .getResultList());
    }


    // select o from OcorrenciaComponenteCurricular o where o.oferecimentoComponenteCurricular.unidade.ativo = true  and o.ativo = true and o.data = ?1 AND o.sala = ?2 and o.oferecimentoComponenteCurricular <> ?3 and o.oferecimentoComponenteCurricular.unidade = ?4
    public static final String SQL_VERIFICAR_EXISTE_CONFLITO_COM_OFERECIMENTO =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o LEFT JOIN edc_oferecimento_componente_curricular j_o_oferecimentoComponenteCurricular ON j_o_oferecimentoComponenteCurricular.id = o.id_oferecimento_componente_curricular LEFT JOIN bas_unidade j_j_o_oferecimentoComponenteCurricular_unidade ON j_j_o_oferecimentoComponenteCurricular_unidade.id = j_o_oferecimentoComponenteCurricular.id_unidade WHERE j_j_o_oferecimentoComponenteCurricular_unidade.fl_ativo = true and o.fl_ativo = true and o.data = ?1 AND o.id_sala = ?2 and o.id_oferecimento_componente_curricular <> ?3 and j_o_oferecimentoComponenteCurricular.id_unidade = ?4";

    // Atencao: a query original seleciona 'OcorrenciaComponenteCurricular', nao 'OferecimentoComponenteCurricular'.
    // Se 'OcorrenciaComponenteCurricular' existir como entidade neste microsservico, troque Object por OcorrenciaComponenteCurricular.class abaixo.
    public Uni<java.util.List<Object>> verificarExisteConflitoComOferecimento(Date data, Long salaId, Long oferecimentoComponenteCurricularId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_EXISTE_CONFLITO_COM_OFERECIMENTO)
                        .setParameter(1, data)
                        .setParameter(2, salaId)
                        .setParameter(3, oferecimentoComponenteCurricularId)
                        .setParameter(4, unidadeId)
                        .getResultList());
    }


    // select o from OcorrenciaComponenteCurricular o where o.oferecimentoComponenteCurricular.unidade.ativo = true  and o.ativo = true and o.data = ?1 AND o.sala = ?2 and o.oferecimentoComponenteCurricular not in (?3) and o.oferecimentoComponenteCurricular.unidade = ?4
    public static final String SQL_VERIFICAR_EXISTE_CONFLITO_COM_OFERECIMENTOS =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o LEFT JOIN edc_oferecimento_componente_curricular j_o_oferecimentoComponenteCurricular ON j_o_oferecimentoComponenteCurricular.id = o.id_oferecimento_componente_curricular LEFT JOIN bas_unidade j_j_o_oferecimentoComponenteCurricular_unidade ON j_j_o_oferecimentoComponenteCurricular_unidade.id = j_o_oferecimentoComponenteCurricular.id_unidade WHERE j_j_o_oferecimentoComponenteCurricular_unidade.fl_ativo = true and o.fl_ativo = true and o.data = ?1 AND o.id_sala = ?2 and o.id_oferecimento_componente_curricular not in (?3) and j_o_oferecimentoComponenteCurricular.id_unidade = ?4";

    // Atencao: a query original seleciona 'OcorrenciaComponenteCurricular', nao 'OferecimentoComponenteCurricular'.
    // Se 'OcorrenciaComponenteCurricular' existir como entidade neste microsservico, troque Object por OcorrenciaComponenteCurricular.class abaixo.
    public Uni<java.util.List<Object>> verificarExisteConflitoComOferecimentos(Date data, Long salaId, List<Long> oferecimentoComponenteCurricularIds, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_EXISTE_CONFLITO_COM_OFERECIMENTOS)
                        .setParameter(1, data)
                        .setParameter(2, salaId)
                        .setParameter(3, oferecimentoComponenteCurricularIds)
                        .setParameter(4, unidadeId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where o.unidade.ativo = true and o.componenteCurricular = ?1
    public static final String SQL_BUSCAR_COMPONENTESS_DO_OFERECIMENTOS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_componente_curricular = ?1";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarComponentessDoOferecimentos(Long componenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPONENTESS_DO_OFERECIMENTOS, OferecimentoComponenteCurricular.class)
                        .setParameter(1, componenteCurricularId)
                        .getResultList());
    }


    // select o from OcorrenciaComponenteCurricular o where o.oferecimentoComponenteCurricular.unidade.ativo = true  and o.ativo = true and o.data = ?1 AND o.sala = ?2 AND o.oferecimentoComponenteCurricular <> ?3
    public static final String SQL_VERIFICAR_EXISTE_CONFLITO_PRORROGANDO_DISCIPLINA =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o LEFT JOIN edc_oferecimento_componente_curricular j_o_oferecimentoComponenteCurricular ON j_o_oferecimentoComponenteCurricular.id = o.id_oferecimento_componente_curricular LEFT JOIN bas_unidade j_j_o_oferecimentoComponenteCurricular_unidade ON j_j_o_oferecimentoComponenteCurricular_unidade.id = j_o_oferecimentoComponenteCurricular.id_unidade WHERE j_j_o_oferecimentoComponenteCurricular_unidade.fl_ativo = true and o.fl_ativo = true and o.data = ?1 AND o.id_sala = ?2 AND o.id_oferecimento_componente_curricular <> ?3";

    // Atencao: a query original seleciona 'OcorrenciaComponenteCurricular', nao 'OferecimentoComponenteCurricular'.
    // Se 'OcorrenciaComponenteCurricular' existir como entidade neste microsservico, troque Object por OcorrenciaComponenteCurricular.class abaixo.
    public Uni<java.util.List<Object>> verificarExisteConflitoProrrogandoDisciplina(Date data, Long salaId, Long oId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_EXISTE_CONFLITO_PRORROGANDO_DISCIPLINA)
                        .setParameter(1, data)
                        .setParameter(2, salaId)
                        .setParameter(3, oId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares c where  o.unidade.ativo = true  and c.ativo = true and o = ?1 order by c.data
    public static final String SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular c ON c.id_oferecimento_componente_curricular = o.id LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and c.fl_ativo = true and o.id = ?1 ORDER BY c.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoComOcorrencia(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA, OferecimentoComponenteCurricular.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares c where o = ?1 order by c.data
    public static final String SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA_TODOS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular c ON c.id_oferecimento_componente_curricular = o.id WHERE o.id = ?1 ORDER BY c.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoComOcorrenciaTodos(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA_TODOS, OferecimentoComponenteCurricular.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o  where  o.unidade.ativo = true and o.sala = ?1 and (o.status = 'LIBERADA' or o.status  = 'PENDENTE' or o.status  = 'LOTADA' or o.status = 'EM_ANDAMENTO')
    public static final String SQL_BUSCAR_OFERECIMENTO_ABERTAS_COM_SALA =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_sala = ?1 and (o.status = 'LIBERADA' or o.status = 'PENDENTE' or o.status = 'LOTADA' or o.status = 'EM_ANDAMENTO')";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoAbertasComSala(Long salaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_ABERTAS_COM_SALA, OferecimentoComponenteCurricular.class)
                        .setParameter(1, salaId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o join fetch o.diasAula c where o.unidade.ativo = true and o = ?1
    public static final String SQL_BUSCAR_OFERECIMENTO_COM_DIAS_AULA =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_oferecimento_dias_aula o_c_jt ON o_c_jt.id_oferecimento_componente_curricular = o.id INNER JOIN edc_dia_aula c ON c.id = o_c_jt.id_dia_aula LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id = ?1";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoComDiasAula(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_COM_DIAS_AULA, OferecimentoComponenteCurricular.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // select distinct o from OferecimentoComponenteCurricular o  where o.unidade.ativo = true  and (o.status='LOTADA' or o.status='LIBERADA' ) AND o.dataInicio <= current_date
    public static final String SQL_LISTAR_OFERECIMENTOS_EM_ANDAMENTO =
            "SELECT DISTINCT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and (o.status='LOTADA' or o.status='LIBERADA' ) AND o.data_inicio <= current_date";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosEmAndamento() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_EM_ANDAMENTO, OferecimentoComponenteCurricular.class)

                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where  o.unidade.ativo = true and o.status='PENDENTE' AND o.unidade in (?1)
    public static final String SQL_LISTAR_OFERECIMENTOS_PENDENTES =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.status='PENDENTE' AND o.id_unidade in (?1)";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosPendentes(List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_PENDENTES, OferecimentoComponenteCurricular.class)
                        .setParameter(1, unidadesIds)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'LOTADA' OR o.status = 'EM_ANDAMENTO') AND o.componenteCurricular in (?1) AND o.unidade in (?2) AND o not in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3) order by o.componenteCurricular
    public static final String SQL_LISTAR_OFERECIMENTOS_DISPONIVEIS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and (o.status = 'LIBERADA' OR o.status = 'LOTADA' OR o.status = 'EM_ANDAMENTO') AND o.id_componente_curricular in (?1) AND o.id_unidade in (?2) AND o not in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3) ORDER BY o.id_componente_curricular";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosDisponiveis(List<Long> componentesIds, List<Long> unidadesIds, Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_DISPONIVEIS, OferecimentoComponenteCurricular.class)
                        .setParameter(1, componentesIds)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, pessoaId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where o.unidade.ativo = true and(o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO')  AND o.componenteCurricular in (?1) AND o.unidade in (?2) and o.grupo.nome = ?4 AND  o not in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3) order by o.componenteCurricular
    public static final String SQL_LISTAR_OFERECIMENTOS_DISPONIVEIS_COM_GRUPO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_grupo j_o_grupo ON j_o_grupo.id = o.id_grupo WHERE j_o_unidade.fl_ativo = true and(o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') AND o.id_componente_curricular in (?1) AND o.id_unidade in (?2) and j_o_grupo.nome = ?4 AND o not in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3) ORDER BY o.id_componente_curricular";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosDisponiveisComGrupo(List<Long> componentesIds, List<Long> unidadesIds, Long pessoaId, String grupo) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_DISPONIVEIS_COM_GRUPO, OferecimentoComponenteCurricular.class)
                        .setParameter(1, componentesIds)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, pessoaId)
                        .setParameter(4, grupo)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO')  AND o.componenteCurricular in (?1) AND o.unidade in (?2) and o.grupo.nome = ?4 AND  o in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3 and (m.status = 'CANCELADO' or m.status = 'FINALIZADA')) order by o.componenteCurricular
    public static final String SQL_LISTAR_OFERECIMENTOS_REMATRICULA_DISPONIVEIS_COM_GRUPO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_grupo j_o_grupo ON j_o_grupo.id = o.id_grupo WHERE j_o_unidade.fl_ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') AND o.id_componente_curricular in (?1) AND o.id_unidade in (?2) and j_o_grupo.nome = ?4 AND o in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3 and (m.status = 'CANCELADO' or m.status = 'FINALIZADA')) ORDER BY o.id_componente_curricular";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosRematriculaDisponiveisComGrupo(List<Long> componentesIds, List<Long> unidadesIds, Long pessoaId, String grupo) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_REMATRICULA_DISPONIVEIS_COM_GRUPO, OferecimentoComponenteCurricular.class)
                        .setParameter(1, componentesIds)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, pessoaId)
                        .setParameter(4, grupo)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where  o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO')  AND o.componenteCurricular in (?1) AND o.unidade.id = ?2 and o.grupo.nome = ?4 AND  o not in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3) order by o.componenteCurricular
    public static final String SQL_LISTAR_OFERECIMENTOS_DISPONIVEIS_COM_GRUPO_UNIDADE =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_grupo j_o_grupo ON j_o_grupo.id = o.id_grupo WHERE j_o_unidade.fl_ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') AND o.id_componente_curricular in (?1) AND j_o_unidade.id = ?2 and j_o_grupo.nome = ?4 AND o not in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3) ORDER BY o.id_componente_curricular";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosDisponiveisComGrupoUnidade(List<Long> componentesIds, Integer codunidade, Long pessoaId, String grupo) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_DISPONIVEIS_COM_GRUPO_UNIDADE, OferecimentoComponenteCurricular.class)
                        .setParameter(1, componentesIds)
                        .setParameter(2, codunidade)
                        .setParameter(3, pessoaId)
                        .setParameter(4, grupo)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares oc where  o.unidade.ativo = true and oc.ativo = true  and o= ?1 order by oc.data
    public static final String SQL_BUSCAR_OCORRENCIA_COM_O_FERECIMENTO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular oc ON oc.id_oferecimento_componente_curricular = o.id LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and oc.fl_ativo = true and o.id= ?1 ORDER BY oc.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOcorrenciaComOFerecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_COM_O_FERECIMENTO, OferecimentoComponenteCurricular.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares oc where   o.unidade.ativo = true and o= ?1 order by oc.data
    public static final String SQL_BUSCAR_TODOS_OCORRENCIA_COM_O_FERECIMENTO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular oc ON oc.id_oferecimento_componente_curricular = o.id LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id= ?1 ORDER BY oc.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarTodosOcorrenciaComOFerecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TODOS_OCORRENCIA_COM_O_FERECIMENTO, OferecimentoComponenteCurricular.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // select oc from OcorrenciaComponenteCurricular oc inner join oc.oferecimentoComponenteCurricular o  where   o.unidade.ativo = true and oc.ativo = true and o.unidade in (?1) and date(oc.data) between ?2 and ?3 order by oc.data, oc.diaAula.turnoEducacao.descricao
    public static final String SQL_LISTAGEM_OFERECIMENTO_POR_UNIDADE_CALENDARIO =
            "SELECT oc.* FROM edc_ocorrencia_componente_curricular oc INNER JOIN edc_oferecimento_componente_curricular o ON o.id = oc.id_oferecimento_componente_curricular LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_dia_aula j_oc_diaAula ON j_oc_diaAula.id = oc.id_dia_aula LEFT JOIN edc_turno j_j_oc_diaAula_turnoEducacao ON j_j_oc_diaAula_turnoEducacao.id = j_oc_diaAula.id_turno WHERE j_o_unidade.fl_ativo = true and oc.fl_ativo = true and o.id_unidade in (?1) and date(oc.data) between ?2 and ?3 ORDER BY oc.data, j_j_oc_diaAula_turnoEducacao.descricao";

    // Atencao: a query original seleciona 'OcorrenciaComponenteCurricular', nao 'OferecimentoComponenteCurricular'.
    // Se 'OcorrenciaComponenteCurricular' existir como entidade neste microsservico, troque Object por OcorrenciaComponenteCurricular.class abaixo.
    public Uni<java.util.List<Object>> listagemOferecimentoPorUnidadeCalendario(Long unidadesId, Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAGEM_OFERECIMENTO_POR_UNIDADE_CALENDARIO)
                        .setParameter(1, unidadesId)
                        .setParameter(2, inicio)
                        .setParameter(3, fim)
                        .getResultList());
    }


    // select distinct o from OferecimentoComponenteCurricular o where   o.unidade.ativo = true and (lower(o.componenteCurricular.descricao) like '%' || ?1 || '%' or str(o.id) like '%' || ?1 || '%')  and o.status = 'EM_ANDAMENTO'  AND o.unidade in (?2) order by o.id
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE =
            "SELECT DISTINCT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_componente_curricular j_o_componenteCurricular ON j_o_componenteCurricular.id = o.id_componente_curricular WHERE j_o_unidade.fl_ativo = true and (lower(j_o_componenteCurricular.descricao) like '%' || ?1 || '%' or CAST(o.id AS text) like '%' || ?1 || '%') and o.status = 'EM_ANDAMENTO' AND o.id_unidade in (?2) ORDER BY o.id LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> autoCompleteComUnidade(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE, OferecimentoComponenteCurricular.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // select distinct o from OferecimentoComponenteCurricular o where   o.unidade.ativo = true and (lower(o.componenteCurricular.descricao) like '%' || ?1 || '%' or str(o.id) like '%' || ?1 || '%')  and (o.status = 'EM_ANDAMENTO' or o.status = 'LIBERADA') AND o.unidade in (?2) order by o.id
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE_CHAMADA_ASSINADA =
            "SELECT DISTINCT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_componente_curricular j_o_componenteCurricular ON j_o_componenteCurricular.id = o.id_componente_curricular WHERE j_o_unidade.fl_ativo = true and (lower(j_o_componenteCurricular.descricao) like '%' || ?1 || '%' or CAST(o.id AS text) like '%' || ?1 || '%') and (o.status = 'EM_ANDAMENTO' or o.status = 'LIBERADA') AND o.id_unidade in (?2) ORDER BY o.id LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> autoCompleteComUnidadeChamadaAssinada(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE_CHAMADA_ASSINADA, OferecimentoComponenteCurricular.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // select distinct o.grupo.nome from OferecimentoComponenteCurricular o where   o.unidade.ativo = true and o.curriculo = ?1 AND o.unidade in (?2) and o.grupo is not null   and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') order by o.grupo.nome
    public static final String SQL_LISTAR_GRUPOS_DISPONIVEIS_COM_UNIDADES =
            "SELECT DISTINCT j_o_grupo.nome FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_grupo j_o_grupo ON j_o_grupo.id = o.id_grupo WHERE j_o_unidade.fl_ativo = true and o.id_curso = ?1 AND o.id_unidade in (?2) and o.id_grupo is not null and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') ORDER BY j_o_grupo.nome";

    public Uni<java.util.List<Object>> listarGruposDisponiveisComUnidades(Long curriculoId, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_GRUPOS_DISPONIVEIS_COM_UNIDADES)
                        .setParameter(1, curriculoId)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // select distinct o.grupo.nome from OferecimentoComponenteCurricular o where   o.unidade.ativo = true and o.curriculo = ?1  AND o.unidade in (?2) and o.grupo is not null and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') and   o in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3 and (m.status = 'CANCELADO' or m.status = 'FINALIZADA')) order by o.grupo.nome
    public static final String SQL_LISTAR_GRUPOS_DISPONIVEIS_COM_UNIDADES_REMATRICULA =
            "SELECT DISTINCT j_o_grupo.nome FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade LEFT JOIN edc_grupo j_o_grupo ON j_o_grupo.id = o.id_grupo WHERE j_o_unidade.fl_ativo = true and o.id_curso = ?1 AND o.id_unidade in (?2) and o.id_grupo is not null and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') and o in(select m.oferecimentoComponenteCurricular from Matricula m where m.contrato.pessoa = ?3 and (m.status = 'CANCELADO' or m.status = 'FINALIZADA')) ORDER BY j_o_grupo.nome";

    public Uni<java.util.List<Object>> listarGruposDisponiveisComUnidadesRematricula(Long curriculoId, List<Long> unidadesIds, Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_GRUPOS_DISPONIVEIS_COM_UNIDADES_REMATRICULA)
                        .setParameter(1, curriculoId)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, pessoaId)
                        .getResultList());
    }


    // select  o from OferecimentoComponenteCurricular o where   o.unidade.ativo = true and o.grupo = ?1 and o.status <> 'CANCELADA'  and o.dataFim is not null and o.dataInicio is not null order by o.dataFim desc
    public static final String SQL_ULTIMO_OFERECIMENTO_DO_GRUPO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_grupo = ?1 and o.status <> 'CANCELADA' and o.data_fim is not null and o.data_inicio is not null ORDER BY o.data_fim desc LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> ultimoOferecimentoDoGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ULTIMO_OFERECIMENTO_DO_GRUPO, OferecimentoComponenteCurricular.class)
                        .setParameter(1, grupoId)
                        .getResultList());
    }


    // select  o from OferecimentoComponenteCurricular o where   o.unidade.ativo = true and o.grupo = ?1 and o.id <> ?2 and o.status <> 'CANCELADA'  and o.dataFim is not null and o.dataInicio is not null order by o.dataFim desc
    public static final String SQL_ULTIMO_OFERECIMENTO_DO_GRUPO_C_OM_I_D =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_grupo = ?1 and o.id <> ?2 and o.status <> 'CANCELADA' and o.data_fim is not null and o.data_inicio is not null ORDER BY o.data_fim desc LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> ultimoOferecimentoDoGrupoCOmID(Long grupoId, Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ULTIMO_OFERECIMENTO_DO_GRUPO_C_OM_I_D, OferecimentoComponenteCurricular.class)
                        .setParameter(1, grupoId)
                        .setParameter(2, id)
                        .getResultList());
    }


    // select  o from OferecimentoComponenteCurricular o where  o.unidade.ativo = true and o.grupo = ?1 and o.componenteCurricular = ?2 and o.status <> 'CANCELADA' order by o.dataFim desc
    public static final String SQL_ULTIMO_OFERECIMENTO_DO_GRUPO_COMPONENTE =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_grupo = ?1 and o.id_componente_curricular = ?2 and o.status <> 'CANCELADA' ORDER BY o.data_fim desc LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> ultimoOferecimentoDoGrupoComponente(Long grupoId, Long componenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ULTIMO_OFERECIMENTO_DO_GRUPO_COMPONENTE, OferecimentoComponenteCurricular.class)
                        .setParameter(1, grupoId)
                        .setParameter(2, componenteCurricularId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where  o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') AND o.unidade = ?1 order by o.id
    public static final String SQL_CONSULTA_LISTAR_OFERECIMENTOS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') AND o.id_unidade = ?1 ORDER BY o.id";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> consultaListarOferecimentos(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CONSULTA_LISTAR_OFERECIMENTOS, OferecimentoComponenteCurricular.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // select o from OferecimentoComponenteCurricular o where o.grupo = ?1 order by o.dataInicio desc
    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosPorGrupo(Long grupoId) {
        return find("grupoId = ?1 order by dataInicio desc", grupoId).list();
    }


    // Feriados (bas_feriado) no intervalo - inclui nacionais e os da unidade e do tipo de curso
    // do oferecimento (join tables bas_feriado_unidade / bas_feriado_tipo_curso), como o
    // FeriadoRepository.buscarFeriadoUnidade do legado (basico).
    public static final String SQL_BUSCAR_FERIADOS =
            "SELECT DISTINCT f.dt_feriado FROM bas_feriado f " +
                    "LEFT JOIN bas_feriado_unidade fu ON fu.id_feriado = f.id " +
                    "LEFT JOIN bas_feriado_tipo_curso ft ON ft.id_feriado = f.id " +
                    "WHERE f.dt_feriado between ?1 and ?2 " +
                    "AND (f.fl_nacional = true OR (?3 IS NOT NULL AND fu.id_unidade = ?3)) " +
                    "AND (COALESCE(f.fl_tipo_curso, false) = false OR (?4 IS NOT NULL AND ft.id_tipo_curso = ?4))";

    public Uni<java.util.List<java.util.Date>> buscarFeriados(Date inicio, Date fim, Long unidadeId, Long tipoCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADOS)
                        .setParameter(1, inicio)
                        .setParameter(2, fim)
                        .setParameter(3, unidadeId)
                        .setParameter(4, tipoCursoId)
                        .getResultList())
                .map(list -> list.stream().map(java.util.Date.class::cast).toList());
    }


    // Dias de aula de todos os oferecimentos de um grupo (join table edc_oferecimento_dias_aula).
    public static final String SQL_BUSCAR_DIAS_AULA_POR_GRUPO =
            "SELECT DISTINCT da.id, da.id_dia_semana, da.id_turno, da.id_tempo_aula " +
                    "FROM edc_oferecimento_dias_aula oda " +
                    "JOIN edc_oferecimento_componente_curricular o ON o.id = oda.id_oferecimento_componente_curricular " +
                    "JOIN edc_dia_aula da ON da.id = oda.id_dia_aula " +
                    "WHERE o.id_grupo = ?1 ORDER BY da.id";

    public Uni<java.util.List<DiaAulaGrupoDTO>> buscarDiasAulaPorGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_DIAS_AULA_POR_GRUPO, Tuple.class)
                        .setParameter(1, grupoId)
                        .getResultList())
                .map(list -> list.stream()
                        .map(t -> (Tuple) t)
                        .map(t -> new DiaAulaGrupoDTO(
                                t.get("id", Long.class),
                                t.get("id_dia_semana", Long.class),
                                t.get("id_turno", Long.class),
                                t.get("id_tempo_aula", Long.class)
                        ))
                        .toList());
    }

    // Dias de aula de um oferecimento especifico (join table edc_oferecimento_dias_aula) -
    // migrado de DiaAulaService.buscaDiasAulaOferecimentoList (legado).
    public static final String SQL_BUSCAR_DIAS_AULA_POR_OFERECIMENTO =
            "SELECT DISTINCT da.id, da.id_dia_semana, da.id_turno, da.id_tempo_aula, " +
                    "       te.descricao as turno_descricao, te.inicio as turno_inicio, te.fim as turno_fim, " +
                    "       ta.descricao as tempo_descricao, ta.minutos_aula as tempo_minutos " +
                    "FROM edc_oferecimento_dias_aula oda " +
                    "JOIN edc_dia_aula da ON da.id = oda.id_dia_aula " +
                    "LEFT JOIN edc_turno te ON te.id = da.id_turno " +
                    "LEFT JOIN edc_tempo_aula ta ON ta.id = da.id_tempo_aula " +
                    "WHERE oda.id_oferecimento_componente_curricular = ?1 ORDER BY da.id";

    public record DiaAulaCompletoDTO(
            Long id,
            Long diaSemanaId,
            Long turnoEducacaoId,
            Long tempoAulaId,
            String turnoDescricao,
            java.time.LocalTime turnoInicio,
            java.time.LocalTime turnoFim,
            String tempoDescricao,
            Integer tempoMinutos
    ) {}

    public Uni<java.util.List<DiaAulaCompletoDTO>> buscarDiasAulaPorOferecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_DIAS_AULA_POR_OFERECIMENTO, Tuple.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList())
                .map(list -> list.stream()
                        .map(t -> (Tuple) t)
                        .map(t -> new DiaAulaCompletoDTO(
                                t.get("id", Long.class),
                                t.get("id_dia_semana", Long.class),
                                t.get("id_turno", Long.class),
                                t.get("id_tempo_aula", Long.class),
                                t.get("turno_descricao", String.class),
                                t.get("turno_inicio", java.time.LocalTime.class),
                                t.get("turno_fim", java.time.LocalTime.class),
                                t.get("tempo_descricao", String.class),
                                t.get("tempo_minutos", Integer.class)
                        ))
                        .toList());
    }

    private java.time.LocalTime toTime(Object value) {
        if (value == null) return null;
        if (value instanceof java.time.LocalTime t) return t;
        if (value instanceof java.sql.Time t) return t.toLocalTime();
        return null;
    }

    // Migrado de OferecimentoComponenteCurricularService.atualizaDataOferecimento (legado) -
    // recalcula data_inicio/data_fim a partir das ocorrencias ativas e o status.
    public static final String SQL_ATUALIZA_DATA_OFERECIMENTO_DATAS =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " data_inicio = (select oco.data from edc_ocorrencia_componente_curricular oco " +
                    "   where oco.id_oferecimento_componente_curricular = o.id and oco.fl_ativo = true order by oco.data limit 1), " +
                    " data_fim = (select oco.data from edc_ocorrencia_componente_curricular oco " +
                    "   where oco.id_oferecimento_componente_curricular = o.id and oco.fl_ativo = true order by oco.data desc limit 1) " +
                    " where o.id = ?1";

    public static final String SQL_ATUALIZA_DATA_OFERECIMENTO_STATUS =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " status = (case when o.data_inicio > current_date and vagas <= inscritos then 'LOTADA' " +
                    "   when o.data_inicio > current_date and vagas > inscritos then 'LIBERADA' " +
                    "   when o.data_inicio < current_date and o.data_fim > current_date then 'EM_ANDAMENTO' " +
                    "   when o.data_fim < current_date then 'FINALIZADA' " +
                    "   when o.data_cancelamento is not null then 'CANCELADA' else 'LIBERADA' end) " +
                    " where o.id = ?1";

    public Uni<Integer> atualizaDataOferecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_DATA_OFERECIMENTO_DATAS)
                        .setParameter(1, oferecimentoComponenteCurricularId).executeUpdate())
                .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_DATA_OFERECIMENTO_STATUS)
                        .setParameter(1, oferecimentoComponenteCurricularId).executeUpdate());
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarStatosInscritosOferecimento
    // (legado) - recalcula inscritos (contratos ativos) e o status.
    public static final String SQL_ATUALIZA_INSCRITOS_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " inscritos = COALESCE((select count(distinct(con.id)) " +
                    "   from edc_matricula mat inner join edc_contrato con on (con.id = mat.id_contrato) " +
                    "   inner join edc_oferecimento_componente_curricular off on (off.id = mat.id_oferecimento_componente_curricular) " +
                    "   where con.ativo = true and mat.data_cancelamento is null and con.desistente = false and o.id = off.id), 0) " +
                    " where o.id = ?1";

    public static final String SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular ofere SET status = " +
                    " (case when ofere.data_fim < current_date then 'FINALIZADA' " +
                    "   when ofere.id_professor is null then 'PENDENTE' " +
                    "   when ofere.inscritos >= ofere.vagas and ofere.data_inicio > current_date and ofere.data_fim > current_date then 'LOTADA' " +
                    "   when ofere.inscritos < ofere.vagas and ofere.data_inicio > current_date and ofere.data_fim > current_date then 'LIBERADA' " +
                    "   when ofere.data_fim < current_date then 'FINALIZADA' " +
                    "   when ofere.data_inicio <= current_date and ofere.data_fim >= current_date then 'EM_ANDAMENTO' end) " +
                    " where ofere.id = ?1";

    public Uni<Integer> atualizaStatosInscritosOferecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_INSCRITOS_OFERECIMENTO)
                        .setParameter(1, oferecimentoComponenteCurricularId).executeUpdate())
                .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO)
                        .setParameter(1, oferecimentoComponenteCurricularId).executeUpdate());
    }

    // Migrado de OferecimentoComponenteCurricularService.verificarDisciplina (legado, L431-458) -
    // rotina de manutencao executada junto da replicacao automatica.
    public static final String[] SQL_VERIFICAR_DISCIPLINA = {
            "UPDATE edc_oferecimento_componente_curricular o SET status = 'CANCELADA' " +
                    "where (o.status = 'PENDENTE' or o.status = 'LIBERADA') and o.inscritos = 0 " +
                    "and (select count(oco) from edc_ocorrencia_componente_curricular oco where oco.fl_ativo = true " +
                    "and oco.data < current_date and oco.id_oferecimento_componente_curricular = o.id) > " +
                    "(select c.qtd_aulas_tolerancia_matricula from edc_criterio c where c.id_curriculo = o.id_curso order by c.id desc limit 1)",
            "UPDATE edc_oferecimento_componente_curricular o SET status = 'EM_ANDAMENTO' " +
                    "where current_date between o.data_inicio and o.data_fim and o.status != 'CANCELADA'",
            "UPDATE edc_oferecimento_componente_curricular o SET status = 'FINALIZADA' " +
                    "where o.data_fim < current_date and o.status != 'CANCELADA'",
            "UPDATE edc_ocorrencia_componente_curricular oco SET fl_ativo = false " +
                    "from edc_ocorrencia_componente_curricular oco2 " +
                    "inner join edc_oferecimento_componente_curricular oo on (oco2.id_oferecimento_componente_curricular = oo.id) " +
                    "where oco2.id = oco.id and oo.status = 'CANCELADA' and oco2.fl_ativo = true",
            "UPDATE edc_matricula mat SET status = 'FINALIZADA' " +
                    "from edc_oferecimento_componente_curricular ofe " +
                    "where mat.id_oferecimento_componente_curricular = ofe.id and mat.status = 'CURSANDO' " +
                    "and (ofe.status = 'FINALIZADA' or ofe.status = 'CONCLUIDA')",
    };

    public Uni<Integer> verificarDisciplina() {
        return executeAll(SQL_VERIFICAR_DISCIPLINA);
    }

    // Migrado de OferecimentoComponenteCurricularService.verificarchamadaAssinada (legado, L501-512)
    // - parte SQL da rotina (a geracao de PDF/chamadas nao foi portada, vive no dominio chamadaassinada).
    public static final String[] SQL_VERIFICAR_CHAMADA_ASSINADA = {
            "update edc_oferecimento_componente_curricular set qtde_sequencia = 1 where qtde_sequencia = 0",
    };

    public Uni<Integer> verificarchamadaAssinada() {
        return executeAll(SQL_VERIFICAR_CHAMADA_ASSINADA);
    }

    private Uni<Integer> executeAll(String[] sqls) {
        Uni<Integer> chain = Uni.createFrom().item(0);
        for (String sql : sqls) {
            chain = chain.chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                    .flatMap(session -> session.createNativeQuery(sql).executeUpdate()));
        }
        return chain;
    }

    // SQL de selecao da replicacao automatica, configurado em bas_config (chave
    // SQL_REPLICAR_OFERECIMENTOS) - mesmo mecanismo do legado (SchedulingService.replicarOferecimentoAuto).
    public static final String SQL_BUSCAR_CONFIG_REPLICACAO =
            "SELECT valor FROM bas_config WHERE chave = 'SQL_REPLICAR_OFERECIMENTOS' LIMIT 1";

    public Uni<String> buscarSqlConfigReplicacao() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFIG_REPLICACAO).getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null ? null : String.valueOf(list.get(0)));
    }

    // Fallback para o SQL do Config (o mesmo do legado quando a chave nao existe no banco).
    public static final String SQL_REPLICAR_OFERECIMENTOS_PADRAO =
            "SELECT o.id FROM edc_oferecimento_componente_curricular o " +
                    "WHERE o.data_inicio <= (cast(current_date as date) + (o.qtde_dias_replicar)) " +
                    "AND o.status != 'CANCELADA' AND o.fl_replicar = true " +
                    "AND NOT EXISTS (SELECT faju.id FROM bas_feriado_ajuste faju " +
                    "  INNER JOIN bas_feriado fer ON (fer.id = faju.id_feriado) " +
                    "  WHERE faju.fl_ativo = true AND fer.dt_feriado between o.data_inicio and o.data_fim) " +
                    "ORDER BY o.data_inicio LIMIT 50";

    public Uni<java.util.List<Long>> listarIdsParaReplicacao(String sql) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql).getResultList())
                .map(list -> list.stream().map(r -> ((Number) r).longValue()).toList());
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarStatosInscritosOferecimentoTrocaTurma (legado)
    public static final String SQL_ATUALIZA_INSCRITOS_OFERECIMENTO_TROCA_TURMA =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " inscritos = COALESCE((SELECT COUNT(DISTINCT con.id) " +
                    "   FROM edc_matricula mat INNER JOIN edc_contrato con ON (con.id = mat.id_contrato) " +
                    "   INNER JOIN edc_oferecimento_componente_curricular off ON (off.id = mat.id_oferecimento_componente_curricular) " +
                    "   WHERE con.ativo = true AND mat.data_cancelamento IS NULL AND con.desistente = false AND o.id = off.id " +
                    "   AND mat.id_contrato = ?1), 0) " +
                    " WHERE o.id = ?1";

    public static final String SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO_TROCA_TURMA =
            "UPDATE edc_oferecimento_componente_curricular ofere SET status = " +
                    " (CASE WHEN ofere.data_fim < current_date THEN 'FINALIZADA' " +
                    "   WHEN ofere.id_professor IS NULL THEN 'PENDENTE' " +
                    "   WHEN ofere.inscritos >= ofere.vagas AND ofere.data_inicio > current_date AND ofere.data_fim > current_date THEN 'LOTADA' " +
                    "   WHEN ofere.inscritos < ofere.vagas AND ofere.data_inicio > current_date AND ofere.data_fim > current_date THEN 'LIBERADA' " +
                    "   WHEN ofere.data_fim < current_date THEN 'FINALIZADA' " +
                    "   WHEN ofere.data_inicio <= current_date AND ofere.data_fim >= current_date THEN 'EM_ANDAMENTO' END) " +
                    " WHERE ofere.id = ?1";

    public Uni<Void> atulizarStatosInscritosOferecimentoTrocaTurma(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_INSCRITOS_OFERECIMENTO_TROCA_TURMA)
                        .setParameter(1, contratoId).executeUpdate())
                .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO_TROCA_TURMA)
                        .setParameter(1, contratoId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarStatosInscritosOferecimentoGrupo (legado)
    public static final String SQL_ATUALIZA_INSCRITOS_OFERECIMENTO_GRUPO =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " inscritos = COALESCE((SELECT COUNT(DISTINCT con.id) " +
                    "   FROM edc_matricula mat INNER JOIN edc_contrato con ON (con.id = mat.id_contrato) " +
                    "   INNER JOIN edc_oferecimento_componente_curricular off ON (off.id = mat.id_oferecimento_componente_curricular) " +
                    "   WHERE con.ativo = true AND mat.data_cancelamento IS NULL AND con.desistente = false AND o.id = off.id " +
                    "   AND off.id_grupo = ?1), 0) " +
                    " WHERE o.id_grupo = ?1";

    public static final String SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO_GRUPO =
            "UPDATE edc_oferecimento_componente_curricular ofere SET status = " +
                    " (CASE WHEN ofere.data_fim < current_date THEN 'FINALIZADA' " +
                    "   WHEN ofere.id_professor IS NULL THEN 'PENDENTE' " +
                    "   WHEN ofere.inscritos >= ofere.vagas AND ofere.data_inicio > current_date AND ofere.data_fim > current_date THEN 'LOTADA' " +
                    "   WHEN ofere.inscritos < ofere.vagas AND ofere.data_inicio > current_date AND ofere.data_fim > current_date THEN 'LIBERADA' " +
                    "   WHEN ofere.data_fim < current_date THEN 'FINALIZADA' " +
                    "   WHEN ofere.data_inicio <= current_date AND ofere.data_fim >= current_date THEN 'EM_ANDAMENTO' END) " +
                    " WHERE ofere.id_grupo = ?1";

    public Uni<Void> atulizarStatosInscritosOferecimentoGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_INSCRITOS_OFERECIMENTO_GRUPO)
                        .setParameter(1, grupoId).executeUpdate())
                .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO_GRUPO)
                        .setParameter(1, grupoId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarSalasOferecimentoComGrupo (legado)
    public static final String SQL_ATUALIZA_SALAS_OFERECIMENTO_COM_GRUPO =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " id_sala = (SELECT s.id FROM edc_sala s " +
                    "   WHERE s.id_unidade = o.id_unidade AND s.capacidade >= o.vagas " +
                    "   ORDER BY s.capacidade LIMIT 1) " +
                    " WHERE o.id_grupo = ?1 AND o.id_sala IS NULL";

    public Uni<Void> atulizarSalasOferecimentoComGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_SALAS_OFERECIMENTO_COM_GRUPO)
                        .setParameter(1, grupoId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarSalasOferecimentoComOferecimento (legado)
    public static final String SQL_ATUALIZA_SALAS_OFERECIMENTO_COM_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " id_sala = (SELECT s.id FROM edc_sala s " +
                    "   WHERE s.id_unidade = o.id_unidade AND s.capacidade >= o.vagas " +
                    "   ORDER BY s.capacidade LIMIT 1) " +
                    " WHERE o.id = ?1 AND o.id_sala IS NULL";

    public Uni<Void> atulizarSalasOferecimentoComOferecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_SALAS_OFERECIMENTO_COM_OFERECIMENTO)
                        .setParameter(1, oferecimentoComponenteCurricularId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarVagasOferecimento (legado)
    public static final String SQL_ATUALIZA_VAGAS_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular SET vagas = ?2 WHERE id = ?1";

    public Uni<Void> atulizarVagasOferecimento(Long oferecimentoComponenteCurricularId, Integer vagas) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_VAGAS_OFERECIMENTO)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .setParameter(2, vagas).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarStatosInscritosOferecimento (legado)
    // Note: this method already exists as atualizaStatosInscritosOferecimento returning Uni<Integer>
    // Adding variant that returns Uni<Void> for service compatibility
    public Uni<Void> atulizarStatosInscritosOferecimento(Long oferecimentoComponenteCurricularId) {
        return atualizaStatosInscritosOferecimento(oferecimentoComponenteCurricularId).replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.atulizarStatosInscritosOferecimentoCurso (legado)
    public static final String SQL_ATUALIZA_INSCRITOS_OFERECIMENTO_CURSO =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " inscritos = COALESCE((SELECT COUNT(DISTINCT con.id) " +
                    "   FROM edc_matricula mat INNER JOIN edc_contrato con ON (con.id = mat.id_contrato) " +
                    "   INNER JOIN edc_oferecimento_componente_curricular off ON (off.id = mat.id_oferecimento_componente_curricular) " +
                    "   WHERE con.ativo = true AND mat.data_cancelamento IS NULL AND con.desistente = false AND o.id = off.id " +
                    "   AND off.id_curso = ?1), 0) " +
                    " WHERE o.id_curso = ?1";

    public static final String SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO_CURSO =
            "UPDATE edc_oferecimento_componente_curricular ofere SET status = " +
                    " (CASE WHEN ofere.data_fim < current_date THEN 'FINALIZADA' " +
                    "   WHEN ofere.id_professor IS NULL THEN 'PENDENTE' " +
                    "   WHEN ofere.inscritos >= ofere.vagas AND ofere.data_inicio > current_date AND ofere.data_fim > current_date THEN 'LOTADA' " +
                    "   WHEN ofere.inscritos < ofere.vagas AND ofere.data_inicio > current_date AND ofere.data_fim > current_date THEN 'LIBERADA' " +
                    "   WHEN ofere.data_fim < current_date THEN 'FINALIZADA' " +
                    "   WHEN ofere.data_inicio <= current_date AND ofere.data_fim >= current_date THEN 'EM_ANDAMENTO' END) " +
                    " WHERE ofere.id_curso = ?1";

    public Uni<Void> atulizarStatosInscritosOferecimentoCurso(Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_INSCRITOS_OFERECIMENTO_CURSO)
                        .setParameter(1, curriculoId).executeUpdate())
                .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_STATUS_INSCRITOS_OFERECIMENTO_CURSO)
                        .setParameter(1, curriculoId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.atualizaDataOferecimentoGrupo (legado)
    public static final String SQL_ATUALIZA_DATA_OFERECIMENTO_GRUPO_DATAS =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " data_inicio = (SELECT oco.data FROM edc_ocorrencia_componente_curricular oco " +
                    "   WHERE oco.id_oferecimento_componente_curricular = o.id AND oco.fl_ativo = true ORDER BY oco.data LIMIT 1), " +
                    " data_fim = (SELECT oco.data FROM edc_ocorrencia_componente_curricular oco " +
                    "   WHERE oco.id_oferecimento_componente_curricular = o.id AND oco.fl_ativo = true ORDER BY oco.data DESC LIMIT 1) " +
                    " WHERE o.id_grupo = ?1";

    public static final String SQL_ATUALIZA_DATA_OFERECIMENTO_GRUPO_STATUS =
            "UPDATE edc_oferecimento_componente_curricular o SET " +
                    " status = (CASE WHEN o.data_inicio > current_date AND vagas <= inscritos THEN 'LOTADA' " +
                    "   WHEN o.data_inicio > current_date AND vagas > inscritos THEN 'LIBERADA' " +
                    "   WHEN o.data_inicio < current_date AND o.data_fim > current_date THEN 'EM_ANDAMENTO' " +
                    "   WHEN o.data_fim < current_date THEN 'FINALIZADA' " +
                    "   WHEN o.data_cancelamento IS NOT NULL THEN 'CANCELADA' ELSE 'LIBERADA' END) " +
                    " WHERE o.id_grupo = ?1";

    public Uni<Void> atualizaDataOferecimentoGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_DATA_OFERECIMENTO_GRUPO_DATAS)
                        .setParameter(1, grupoId).executeUpdate())
                .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_DATA_OFERECIMENTO_GRUPO_STATUS)
                        .setParameter(1, grupoId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de OferecimentoComponenteCurricularService.ajutarOferecimento (legado)
    public static final String SQL_AJUTAR_OFERECIMENTO =
            "UPDATE edc_oferecimento_componente_curricular SET id_dia_aula = ?2 WHERE id = ?1";

    public Uni<Void> ajutarOferecimento(Long oferecimentoComponenteCurricularId, Long diaAulaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AJUTAR_OFERECIMENTO)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .setParameter(2, diaAulaId).executeUpdate())
                .replaceWithVoid();
    }

    // Fix return types for listarGruposDisponiveisComUnidades and listarGruposDisponiveisComUnidadesRematricula
    public Uni<java.util.List<String>> listarGruposDisponiveisComUnidadesRematriculaStr(Long curriculoId, List<Long> unidadesIds, Long pessoaId) {
        return listarGruposDisponiveisComUnidadesRematricula(curriculoId, unidadesIds, pessoaId)
                .map(list -> list.stream().map(Object::toString).toList());
    }

    public Uni<java.util.List<String>> listarGruposDisponiveisComUnidadesStr(Long curriculoId, List<Long> unidadesIds) {
        return listarGruposDisponiveisComUnidades(curriculoId, unidadesIds)
                .map(list -> list.stream().map(Object::toString).toList());
    }

    // Fix return type for listagemOferecimentoPorUnidadeCalendario
    public Uni<java.util.List<Long>> listagemOferecimentoPorUnidadeCalendarioIds(Long unidadesId, java.util.Date inicio, java.util.Date fim) {
        return listagemOferecimentoPorUnidadeCalendario(unidadesId, inicio, fim)
                .map(list -> list.stream().map(r -> ((Number) r).longValue()).toList());
    }

}