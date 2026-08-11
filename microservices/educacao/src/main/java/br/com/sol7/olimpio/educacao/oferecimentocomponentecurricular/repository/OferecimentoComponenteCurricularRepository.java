package br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular;
import java.util.Date;
import java.util.List;
import br.com.sol7.olimpio.educacao.diaaula.DiaAula;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class OferecimentoComponenteCurricularRepository implements PanacheRepository<OferecimentoComponenteCurricular> {

    // Migrado de OferecimentoComponenteCurricularRepository.buscarMatrizCurricular (legado) - HQL original:
    // select m from MatrizCurricular m where m.curriculo = ?1 order by m.ordem
    public static final String SQL_BUSCAR_MATRIZ_CURRICULAR =
            "SELECT m.* FROM edc_matriz_curricular m WHERE m.id_curriculo = ?1 ORDER BY m.ordem";

    // Atencao: a query original seleciona 'MatrizCurricular', nao 'OferecimentoComponenteCurricular'.
    // Se 'MatrizCurricular' existir como entidade neste microsservico, troque Object por MatrizCurricular.class abaixo.
    public Uni<java.util.List<Object>> buscarMatrizCurricular(Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MATRIZ_CURRICULAR)
                    .setParameter(1, curriculoId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.autocompleteComCurriculoGrupoComQuery (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.autocompleteComCurriculoGrupoSemQuery (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.autocompleteComCurriculoComQuery (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.autocompleteComCurriculoSemQuery (legado) - HQL original:
    // select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and off.curriculo = ?1 and off.status <> 'CANCELADA'
    public static final String SQL_AUTOCOMPLETE_COM_CURRICULO_SEM_QUERY =
            "SELECT DISTINCT off.id_componente_curricular FROM edc_oferecimento_componente_curricular off LEFT JOIN bas_unidade j_off_unidade ON j_off_unidade.id = off.id_unidade WHERE j_off_unidade.fl_ativo = true and off.id_curso = ?1 and off.status <> 'CANCELADA' LIMIT 10";

    public Uni<java.util.List<Object>> autocompleteComCurriculoSemQuery(Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE_COM_CURRICULO_SEM_QUERY)
                    .setParameter(1, curriculoId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.todos (legado) - HQL original:
    // select m from OferecimentoComponenteCurricular m where m.unidade.ativo = true order by m.id
    public static final String SQL_TODOS =
            "SELECT m.* FROM edc_oferecimento_componente_curricular m LEFT JOIN bas_unidade j_m_unidade ON j_m_unidade.id = m.id_unidade WHERE j_m_unidade.fl_ativo = true ORDER BY m.id";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> todos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TODOS, OferecimentoComponenteCurricular.class)

                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.verificarExisteConflito (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.verificarExisteConflitoComOferecimento (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.verificarExisteConflitoComOferecimentos (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.buscarComponentessDoOferecimentos (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o where o.unidade.ativo = true and o.componenteCurricular = ?1
    public static final String SQL_BUSCAR_COMPONENTESS_DO_OFERECIMENTOS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_componente_curricular = ?1";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarComponentessDoOferecimentos(Long componenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPONENTESS_DO_OFERECIMENTOS, OferecimentoComponenteCurricular.class)
                    .setParameter(1, componenteCurricularId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.verificarExisteConflitoProrrogandoDisciplina (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.buscarOferecimentoComOcorrencia (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares c where  o.unidade.ativo = true  and c.ativo = true and o = ?1 order by c.data
    public static final String SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular c ON c.id_oferecimento_componente_curricular = o.id LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and c.fl_ativo = true and o.id = ?1 ORDER BY c.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoComOcorrencia(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA, OferecimentoComponenteCurricular.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.buscarOferecimentoComOcorrenciaTodos (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares c where o = ?1 order by c.data
    public static final String SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA_TODOS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular c ON c.id_oferecimento_componente_curricular = o.id WHERE o.id = ?1 ORDER BY c.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoComOcorrenciaTodos(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_COM_OCORRENCIA_TODOS, OferecimentoComponenteCurricular.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.buscarOferecimentoAbertasComSala (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o  where  o.unidade.ativo = true and o.sala = ?1 and (o.status = 'LIBERADA' or o.status  = 'PENDENTE' or o.status  = 'LOTADA' or o.status = 'EM_ANDAMENTO')
    public static final String SQL_BUSCAR_OFERECIMENTO_ABERTAS_COM_SALA =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_sala = ?1 and (o.status = 'LIBERADA' or o.status = 'PENDENTE' or o.status = 'LOTADA' or o.status = 'EM_ANDAMENTO')";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoAbertasComSala(Long salaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_ABERTAS_COM_SALA, OferecimentoComponenteCurricular.class)
                    .setParameter(1, salaId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.buscarOferecimentoComDiasAula (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o join fetch o.diasAula c where o.unidade.ativo = true and o = ?1
    public static final String SQL_BUSCAR_OFERECIMENTO_COM_DIAS_AULA =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_oferecimento_dias_aula o_c_jt ON o_c_jt.id_oferecimento_componente_curricular = o.id INNER JOIN edc_dia_aula c ON c.id = o_c_jt.id_dia_aula LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id = ?1";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOferecimentoComDiasAula(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO_COM_DIAS_AULA, OferecimentoComponenteCurricular.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.listarOferecimentosEmAndamento (legado) - HQL original:
    // select distinct o from OferecimentoComponenteCurricular o  where o.unidade.ativo = true  and (o.status='LOTADA' or o.status='LIBERADA' ) AND o.dataInicio <= current_date
    public static final String SQL_LISTAR_OFERECIMENTOS_EM_ANDAMENTO =
            "SELECT DISTINCT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and (o.status='LOTADA' or o.status='LIBERADA' ) AND o.data_inicio <= current_date";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosEmAndamento() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_EM_ANDAMENTO, OferecimentoComponenteCurricular.class)

                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.listarOferecimentosPendentes (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o where  o.unidade.ativo = true and o.status='PENDENTE' AND o.unidade in (?1)
    public static final String SQL_LISTAR_OFERECIMENTOS_PENDENTES =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.status='PENDENTE' AND o.id_unidade in (?1)";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosPendentes(List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS_PENDENTES, OferecimentoComponenteCurricular.class)
                    .setParameter(1, unidadesIds)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.listarOferecimentosDisponiveis (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.listarOferecimentosDisponiveisComGrupo (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.listarOferecimentosRematriculaDisponiveisComGrupo (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.listarOferecimentosDisponiveisComGrupoUnidade (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.buscarOcorrenciaComOFerecimento (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares oc where  o.unidade.ativo = true and oc.ativo = true  and o= ?1 order by oc.data
    public static final String SQL_BUSCAR_OCORRENCIA_COM_O_FERECIMENTO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular oc ON oc.id_oferecimento_componente_curricular = o.id LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and oc.fl_ativo = true and o.id= ?1 ORDER BY oc.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarOcorrenciaComOFerecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_COM_O_FERECIMENTO, OferecimentoComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.buscarTodosOcorrenciaComOFerecimento (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares oc where   o.unidade.ativo = true and o= ?1 order by oc.data
    public static final String SQL_BUSCAR_TODOS_OCORRENCIA_COM_O_FERECIMENTO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_ocorrencia_componente_curricular oc ON oc.id_oferecimento_componente_curricular = o.id LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id= ?1 ORDER BY oc.data";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> buscarTodosOcorrenciaComOFerecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TODOS_OCORRENCIA_COM_O_FERECIMENTO, OferecimentoComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.listagemOferecimentoPorUnidadeCalendario (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.autoCompleteComUnidade (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.autoCompleteComUnidadeChamadaAssinada (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.listarGruposDisponiveisComUnidades (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.listarGruposDisponiveisComUnidadesRematricula (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.ultimoOferecimentoDoGrupo (legado) - HQL original:
    // select  o from OferecimentoComponenteCurricular o where   o.unidade.ativo = true and o.grupo = ?1 and o.status <> 'CANCELADA'  and o.dataFim is not null and o.dataInicio is not null order by o.dataFim desc
    public static final String SQL_ULTIMO_OFERECIMENTO_DO_GRUPO =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and o.id_grupo = ?1 and o.status <> 'CANCELADA' and o.data_fim is not null and o.data_inicio is not null ORDER BY o.data_fim desc LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> ultimoOferecimentoDoGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ULTIMO_OFERECIMENTO_DO_GRUPO, OferecimentoComponenteCurricular.class)
                    .setParameter(1, grupoId)
                    .getResultList());
    }


    // Migrado de OferecimentoComponenteCurricularRepository.ultimoOferecimentoDoGrupoCOmID (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.ultimoOferecimentoDoGrupoComponente (legado) - HQL original:
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


    // Migrado de OferecimentoComponenteCurricularRepository.consultaListarOferecimentos (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o where  o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') AND o.unidade = ?1 order by o.id
    public static final String SQL_CONSULTA_LISTAR_OFERECIMENTOS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o LEFT JOIN bas_unidade j_o_unidade ON j_o_unidade.id = o.id_unidade WHERE j_o_unidade.fl_ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') AND o.id_unidade = ?1 ORDER BY o.id";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> consultaListarOferecimentos(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CONSULTA_LISTAR_OFERECIMENTOS, OferecimentoComponenteCurricular.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }


    // Migrado de GrupoRepository.listarOferecimentos (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o where o.grupo = ?1 order by o.dataInicio desc
    public Uni<java.util.List<OferecimentoComponenteCurricular>> listarOferecimentosPorGrupo(Long grupoId) {
        return find("grupoId = ?1 order by dataInicio desc", grupoId).list();
    }


    // Feriados nacionais (bas_feriado) no intervalo - o legado filtrava por unidade/tipo de curso
    // (basico), aqui limitamos a fl_nacional = true.
    public static final String SQL_BUSCAR_FERIADOS_NACIONAIS =
            "SELECT dt_feriado FROM bas_feriado WHERE fl_nacional = true AND dt_feriado between ?1 and ?2";

    public Uni<java.util.List<java.util.Date>> buscarFeriadosNacionais(Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_FERIADOS_NACIONAIS)
                    .setParameter(1, inicio)
                    .setParameter(2, fim)
                    .getResultList())
                .map(list -> list.stream().map(java.util.Date.class::cast).toList());
    }


    // Dias de aula de todos os oferecimentos de um grupo (join table edc_oferecimento_dias_aula).
    public static final String SQL_BUSCAR_DIAS_AULA_POR_GRUPO =
            "SELECT DISTINCT da.* FROM edc_oferecimento_dias_aula oda " +
            "JOIN edc_oferecimento_componente_curricular o ON o.id = oda.id_oferecimento_componente_curricular " +
            "JOIN edc_dia_aula da ON da.id = oda.id_dia_aula " +
            "WHERE o.id_grupo = ?1 ORDER BY da.id";

    public Uni<java.util.List<DiaAula>> buscarDiasAulaPorGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_DIAS_AULA_POR_GRUPO, DiaAula.class)
                    .setParameter(1, grupoId)
                    .getResultList());
    }

}