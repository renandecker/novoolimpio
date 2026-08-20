package br.com.sol7.olimpio.educacao.matricula;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.educacao.valorcurso.ValorCurso;

@ApplicationScoped
public class MatriculaRepository implements PanacheRepository<Matricula> {

    // Migrado de MatriculaRepository.buscarValorCurso (legado) - HQL original:
    // select v from ValorCurso v inner join v.unidades un where  un.ativo = true and v.curriculo = ?1 and un = ?2 order by v.data desc
    public static final String SQL_BUSCAR_VALOR_CURSO =
            "SELECT v.* FROM edc_valor_curso v INNER JOIN edc_valor_curso_unidade v_un_jt ON v_un_jt.id_valor_curso = v.id INNER JOIN bas_unidade un ON un.id = v_un_jt.id_unidade WHERE un.fl_ativo = true and v.id_curriculo = ?1 and un.id = ?2 ORDER BY v.data desc";

    public Uni<java.util.List<br.com.sol7.olimpio.educacao.valorcurso.ValorCurso>> buscarValorCurso(Long curriculoId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALOR_CURSO, br.com.sol7.olimpio.educacao.valorcurso.ValorCurso.class)
                        .setParameter(1, curriculoId)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.buscarMatriculasPorOferecimento (legado) - HQL original:
    // select m from Matricula m where m.contrato.unidade.ativo = true and m.contrato.unidadeResponsavel.ativo = true and m.oferecimentoComponenteCurricular = ?1 AND m.dataCancelamento is null order by m.contrato.pessoa.pessoaFisica.nome
    public static final String SQL_BUSCAR_MATRICULAS_POR_OFERECIMENTO =
            "SELECT m.* FROM edc_matricula m LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel LEFT JOIN bas_pessoa j_j_m_contrato_pessoa ON j_j_m_contrato_pessoa.id = j_m_contrato.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_j_m_contrato_pessoa_pessoaFisica ON j_j_j_m_contrato_pessoa_pessoaFisica.id_pessoa = j_j_m_contrato_pessoa.id WHERE j_j_m_contrato_unidade.fl_ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_oferecimento_componente_curricular = ?1 AND m.data_cancelamento is null ORDER BY j_j_j_m_contrato_pessoa_pessoaFisica.nome";

    public Uni<java.util.List<Matricula>> buscarMatriculasPorOferecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MATRICULAS_POR_OFERECIMENTO, Matricula.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.buscarMatriculasPorContrato (legado) - HQL original:
    // select m from Matricula m where m.contrato.unidade.ativo = true and m.contrato.unidadeResponsavel.ativo = true and m.contrato = ?1 ORDER By m.oferecimentoComponenteCurricular.dataInicio, m.id,m.oferecimentoComponenteCurricular.id
    public static final String SQL_BUSCAR_MATRICULAS_POR_CONTRATO =
            "SELECT m.* FROM edc_matricula m LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel LEFT JOIN edc_oferecimento_componente_curricular j_m_oferecimentoComponenteCurricular ON j_m_oferecimentoComponenteCurricular.id = m.id_oferecimento_componente_curricular WHERE j_j_m_contrato_unidade.fl_ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_contrato = ?1 ORDER BY j_m_oferecimentoComponenteCurricular.data_inicio, m.id,j_m_oferecimentoComponenteCurricular.id";

    public Uni<java.util.List<Matricula>> buscarMatriculasPorContrato(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MATRICULAS_POR_CONTRATO, Matricula.class)
                        .setParameter(1, contratoId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.buscarMatriculasComCadernoPorContrato (legado) - HQL original:
    // select m from Matricula m left join fetch m.cadernoComponenteCurriculars cc where m.contrato.unidade.ativo = true and m.contrato.unidadeResponsavel.ativo = true and m.contrato = ?1  ORDER By m.oferecimentoComponenteCurricular.dataInicio, m.id,m.oferecimentoComponenteCurricular.id
    public static final String SQL_BUSCAR_MATRICULAS_COM_CADERNO_POR_CONTRATO =
            "SELECT m.* FROM edc_matricula m LEFT JOIN edc_caderno_componente_curricular cc ON cc.id_matricula = m.id LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel LEFT JOIN edc_oferecimento_componente_curricular j_m_oferecimentoComponenteCurricular ON j_m_oferecimentoComponenteCurricular.id = m.id_oferecimento_componente_curricular WHERE j_j_m_contrato_unidade.fl_ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_contrato = ?1 ORDER BY j_m_oferecimentoComponenteCurricular.data_inicio, m.id,j_m_oferecimentoComponenteCurricular.id";

    public Uni<java.util.List<Matricula>> buscarMatriculasComCadernoPorContrato(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MATRICULAS_COM_CADERNO_POR_CONTRATO, Matricula.class)
                        .setParameter(1, contratoId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.buscarMatriculasAtivasNaoConcluidas (legado) - HQL original:
    // select m from Matricula m where m.contrato.unidade.ativo = true and m.contrato.unidadeResponsavel.ativo = true and m.contrato = ?1 and m.dataCancelamento is null and m.status ='CURSANDO'
    public static final String SQL_BUSCAR_MATRICULAS_ATIVAS_NAO_CONCLUIDAS =
            "SELECT m.* FROM edc_matricula m LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel WHERE j_j_m_contrato_unidade.fl_ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_contrato = ?1 and m.data_cancelamento is null and m.status ='CURSANDO'";

    public Uni<java.util.List<Matricula>> buscarMatriculasAtivasNaoConcluidas(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MATRICULAS_ATIVAS_NAO_CONCLUIDAS, Matricula.class)
                        .setParameter(1, contratoId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.buscarMatriculasCanceladas (legado) - HQL original:
    // select m from Matricula m where m.contrato.unidade.ativo = true and m.contrato.unidadeResponsavel.ativo = true and  m.contrato = ?1 and m.dataCancelamento is not null and m.oferecimentoComponenteCurricular.status <> 'CANCELADA' and m.contrato.ativo = false
    public static final String SQL_BUSCAR_MATRICULAS_CANCELADAS =
            "SELECT m.* FROM edc_matricula m LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel LEFT JOIN edc_oferecimento_componente_curricular j_m_oferecimentoComponenteCurricular ON j_m_oferecimentoComponenteCurricular.id = m.id_oferecimento_componente_curricular WHERE j_j_m_contrato_unidade.fl_ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_contrato = ?1 and m.data_cancelamento is not null and j_m_oferecimentoComponenteCurricular.status <> 'CANCELADA' and j_m_contrato.ativo = false";

    public Uni<java.util.List<Matricula>> buscarMatriculasCanceladas(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MATRICULAS_CANCELADAS, Matricula.class)
                        .setParameter(1, contratoId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.buscarComponentesAprovadosPorAlunos (legado) - HQL original:
    // select m.oferecimentoComponenteCurricular.componenteCurricular from Matricula m where m.contrato.unidade.ativo = true and m.contrato.unidadeResponsavel.ativo = true and m.contrato.pessoa = ?1 and m.status = 'APROVADO'
    public static final String SQL_BUSCAR_COMPONENTES_APROVADOS_POR_ALUNOS =
            "SELECT j_m_oferecimentoComponenteCurricular.id_componente_curricular FROM edc_matricula m LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel LEFT JOIN edc_oferecimento_componente_curricular j_m_oferecimentoComponenteCurricular ON j_m_oferecimentoComponenteCurricular.id = m.id_oferecimento_componente_curricular WHERE j_j_m_contrato_unidade.fl_ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and j_m_contrato.id_pessoa = ?1 and m.status = 'APROVADO'";

    public Uni<java.util.List<Object>> buscarComponentesAprovadosPorAlunos(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPONENTES_APROVADOS_POR_ALUNOS)
                        .setParameter(1, pessoaId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.matriculasAtivas (legado) - HQL original:
    // select m from Matricula m where m.contrato.unidade.ativo = true and m.oferecimentoComponenteCurricular = ?1  and m.contrato.ativo = true and m.contrato.unidadeResponsavel.ativo = true  and m.oferecimentoComponenteCurricular = ?1 and m.contrato.ativo = true  and not exists(select d from Desistente d where m.contrato.id = d.contrato.id  and d.ativo = true ) and exists(select c from CadernoComponenteCurricular c where c.matricula.id = m.id and c.ocorrenciaComponenteCurricular.ativo = true  and (c.presenca = 'n' or c.presenca = 'a' or c.presenca = 'm' or c.presenca = 'p' or c.presenca = 't'))
    public static final String SQL_MATRICULAS_ATIVAS =
            "SELECT m.* FROM edc_matricula m LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel WHERE j_j_m_contrato_unidade.fl_ativo = true and m.id_oferecimento_componente_curricular = ?1 and j_m_contrato.ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_oferecimento_componente_curricular = ?1 and j_m_contrato.ativo = true and not exists(select d from Desistente d where j_m_contrato.id = d.contrato.id and d.ativo = true ) and exists(select c from CadernoComponenteCurricular c where c.matricula.id = m.id and c.ocorrenciaComponenteCurricular.ativo = true and (c.presenca = 'n' or c.presenca = 'a' or c.presenca = 'm' or c.presenca = 'p' or c.presenca = 't'))";

    public Uni<java.util.List<Matricula>> matriculasAtivas(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MATRICULAS_ATIVAS, Matricula.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.matriculasAtivasComCaderno (legado) - HQL original:
    // select distinct m from Matricula m left join fetch m.cadernoComponenteCurriculars cc  where m.contrato.unidade.ativo = true and m.oferecimentoComponenteCurricular = ?1  and not exists(select d from Desistente d where m.contrato.id = d.contrato.id  and d.ativo = true ) and m.contrato.unidadeResponsavel.ativo = true and m.oferecimentoComponenteCurricular = ?1  and m.contrato.ativo = true  and exists(select c from CadernoComponenteCurricular c where c.matricula.id = m.id and c.ocorrenciaComponenteCurricular.ativo = true  and (c.presenca = 'n' or c.presenca = 'a' or c.presenca = 'm' or c.presenca = 'p' or c.presenca = 't')) and (cc.presenca = 'n' or cc.presenca = 'a' or cc.presenca = 'm' or cc.presenca = 'p' or cc.presenca = 't')
    public static final String SQL_MATRICULAS_ATIVAS_COM_CADERNO =
            "SELECT DISTINCT m.* FROM edc_matricula m LEFT JOIN edc_caderno_componente_curricular cc ON cc.id_matricula = m.id LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel WHERE j_j_m_contrato_unidade.fl_ativo = true and m.id_oferecimento_componente_curricular = ?1 and not exists(select d from Desistente d where j_m_contrato.id = d.contrato.id and d.ativo = true ) and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_oferecimento_componente_curricular = ?1 and j_m_contrato.ativo = true and exists(select c from CadernoComponenteCurricular c where c.matricula.id = m.id and c.ocorrenciaComponenteCurricular.ativo = true and (c.presenca = 'n' or c.presenca = 'a' or c.presenca = 'm' or c.presenca = 'p' or c.presenca = 't')) and (cc.presenca = 'n' or cc.presenca = 'a' or cc.presenca = 'm' or cc.presenca = 'p' or cc.presenca = 't')";

    public Uni<java.util.List<Matricula>> matriculasAtivasComCaderno(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MATRICULAS_ATIVAS_COM_CADERNO, Matricula.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.matriculasAtivasDoCOntrato (legado) - HQL original:
    // select m from Matricula m where m.contrato = ?1 and m.contrato.unidade.ativo = true  and m.contrato.unidadeResponsavel.ativo = true and m.oferecimentoComponenteCurricular = ?1 and m.contrato.ativo = true  and not exists(select d from Desistente d where m.contrato.id = d.contrato.id  and d.ativo = true ) and exists(select c from CadernoComponenteCurricular c where c.matricula.id = m.id and c.ocorrenciaComponenteCurricular.ativo = true  and (c.presenca = 'n' or c.presenca = 'a' or c.presenca = 'm' or c.presenca = 'p' or c.presenca = 't'))
    public static final String SQL_MATRICULAS_ATIVAS_DO_C_ONTRATO =
            "SELECT m.* FROM edc_matricula m LEFT JOIN edc_contrato j_m_contrato ON j_m_contrato.id = m.id_contrato LEFT JOIN bas_unidade j_j_m_contrato_unidade ON j_j_m_contrato_unidade.id = j_m_contrato.id_unidade LEFT JOIN bas_unidade j_j_m_contrato_unidadeResponsavel ON j_j_m_contrato_unidadeResponsavel.id = j_m_contrato.id_unidade_resposavel WHERE m.id_contrato = ?1 and j_j_m_contrato_unidade.fl_ativo = true and j_j_m_contrato_unidadeResponsavel.fl_ativo = true and m.id_oferecimento_componente_curricular = ?1 and j_m_contrato.ativo = true and not exists(select d from Desistente d where j_m_contrato.id = d.contrato.id and d.ativo = true ) and exists(select c from CadernoComponenteCurricular c where c.matricula.id = m.id and c.ocorrenciaComponenteCurricular.ativo = true and (c.presenca = 'n' or c.presenca = 'a' or c.presenca = 'm' or c.presenca = 'p' or c.presenca = 't'))";

    public Uni<java.util.List<Matricula>> matriculasAtivasDoCOntrato(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MATRICULAS_ATIVAS_DO_C_ONTRATO, Matricula.class)
                        .setParameter(1, contratoId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.matriculasDesativadasComMatriculaAtiva (legado) - HQL original:
    // select distinct c.matricula from CadernoComponenteCurricular c  left join fetch c.matricula.cadernoComponenteCurriculars cc where c.matricula.contrato.unidade.ativo = true and c.matricula.contrato.unidadeResponsavel.ativo = true  and not exists(select d from Desistente d where c.matricula.contrato.id = d.contrato.id  and d.ativo = true ) and c.ocorrenciaComponenteCurricular.oferecimentoComponenteCurricular = ?1   and cc.ocorrenciaComponenteCurricular.oferecimentoComponenteCurricular = ?1 and c.matricula not in (?2)
    public static final String SQL_MATRICULAS_DESATIVADAS_COM_MATRICULA_ATIVA =
            "SELECT DISTINCT c.id_matricula FROM edc_caderno_componente_curricular c LEFT JOIN edc_matricula j_c_matricula ON j_c_matricula.id = c.id_matricula LEFT JOIN edc_contrato j_j_c_matricula_contrato ON j_j_c_matricula_contrato.id = j_c_matricula.id_contrato LEFT JOIN bas_unidade j_j_j_c_matricula_contrato_unidade ON j_j_j_c_matricula_contrato_unidade.id = j_j_c_matricula_contrato.id_unidade LEFT JOIN bas_unidade j_j_j_c_matricula_contrato_unidadeResponsavel ON j_j_j_c_matricula_contrato_unidadeResponsavel.id = j_j_c_matricula_contrato.id_unidade_resposavel LEFT JOIN edc_ocorrencia_componente_curricular j_c_ocorrenciaComponenteCurricular ON j_c_ocorrenciaComponenteCurricular.id = c.id_ocorrencia_componente_curricular WHERE j_j_j_c_matricula_contrato_unidade.fl_ativo = true and j_j_j_c_matricula_contrato_unidadeResponsavel.fl_ativo = true and not exists(select d from Desistente d where j_j_c_matricula_contrato.id = d.contrato.id and d.ativo = true ) and j_c_ocorrenciaComponenteCurricular.id_oferecimento_componente_curricular = ?1 and cc.ocorrenciaComponenteCurricular.oferecimentoComponenteCurricular = ?1 and c.id_matricula not in (?2)";

    public Uni<java.util.List<Object>> matriculasDesativadasComMatriculaAtiva(Long oferecimentoComponenteCurricularId, List<Long> matriculasIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MATRICULAS_DESATIVADAS_COM_MATRICULA_ATIVA)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .setParameter(2, matriculasIds)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.matriculasDesativadasSemMatriculaAtiva (legado) - HQL original:
    // select distinct c.matricula from CadernoComponenteCurricular c  left join fetch c.matricula.cadernoComponenteCurriculars cc where c.matricula.contrato.unidade.ativo = true and c.matricula.contrato.unidadeResponsavel.ativo = true and  c.ocorrenciaComponenteCurricular.oferecimentoComponenteCurricular = ?1   and cc.ocorrenciaComponenteCurricular.oferecimentoComponenteCurricular = ?1
    public static final String SQL_MATRICULAS_DESATIVADAS_SEM_MATRICULA_ATIVA =
            "SELECT DISTINCT c.id_matricula FROM edc_caderno_componente_curricular c LEFT JOIN edc_matricula j_c_matricula ON j_c_matricula.id = c.id_matricula LEFT JOIN edc_contrato j_j_c_matricula_contrato ON j_j_c_matricula_contrato.id = j_c_matricula.id_contrato LEFT JOIN bas_unidade j_j_j_c_matricula_contrato_unidade ON j_j_j_c_matricula_contrato_unidade.id = j_j_c_matricula_contrato.id_unidade LEFT JOIN bas_unidade j_j_j_c_matricula_contrato_unidadeResponsavel ON j_j_j_c_matricula_contrato_unidadeResponsavel.id = j_j_c_matricula_contrato.id_unidade_resposavel LEFT JOIN edc_ocorrencia_componente_curricular j_c_ocorrenciaComponenteCurricular ON j_c_ocorrenciaComponenteCurricular.id = c.id_ocorrencia_componente_curricular WHERE j_j_j_c_matricula_contrato_unidade.fl_ativo = true and j_j_j_c_matricula_contrato_unidadeResponsavel.fl_ativo = true and j_c_ocorrenciaComponenteCurricular.id_oferecimento_componente_curricular = ?1 and cc.ocorrenciaComponenteCurricular.oferecimentoComponenteCurricular = ?1";

    public Uni<java.util.List<Object>> matriculasDesativadasSemMatriculaAtiva(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MATRICULAS_DESATIVADAS_SEM_MATRICULA_ATIVA)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de MatriculaRepository.qtdFaltasConsecutivas (legado) - HQL original:
    // select count(distinct c.matricula) from CadernoComponenteCurricular c where  c.matricula.contrato.unidade.ativo = true and c.matricula.contrato.unidadeResponsavel.ativo = true and  c.presenca = 'a' and c.matricula = ?1
    public static final String SQL_QTD_FALTAS_CONSECUTIVAS =
            "SELECT count(distinct c.id_matricula) FROM edc_caderno_componente_curricular c LEFT JOIN edc_matricula j_c_matricula ON j_c_matricula.id = c.id_matricula LEFT JOIN edc_contrato j_j_c_matricula_contrato ON j_j_c_matricula_contrato.id = j_c_matricula.id_contrato LEFT JOIN bas_unidade j_j_j_c_matricula_contrato_unidade ON j_j_j_c_matricula_contrato_unidade.id = j_j_c_matricula_contrato.id_unidade LEFT JOIN bas_unidade j_j_j_c_matricula_contrato_unidadeResponsavel ON j_j_j_c_matricula_contrato_unidadeResponsavel.id = j_j_c_matricula_contrato.id_unidade_resposavel WHERE j_j_j_c_matricula_contrato_unidade.fl_ativo = true and j_j_j_c_matricula_contrato_unidadeResponsavel.fl_ativo = true and c.presenca = 'a' and c.id_matricula = ?1";

    public Uni<java.util.List<Object>> qtdFaltasConsecutivas(Long matriculaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_QTD_FALTAS_CONSECUTIVAS)
                        .setParameter(1, matriculaId)
                        .getResultList());
    }

}