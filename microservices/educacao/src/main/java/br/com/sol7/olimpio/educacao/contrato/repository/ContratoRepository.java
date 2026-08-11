package br.com.sol7.olimpio.educacao.contrato;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ContratoRepository implements PanacheRepository<Contrato> {

    // Migrado de ContratoRepository.buscarContratosPessoa (legado) - HQL original:
    // Select c from Contrato c where c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.pessoa = ?1 order by c.id desc
    public static final String SQL_BUSCAR_CONTRATOS_PESSOA =
            "SELECT c.* FROM edc_contrato c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id_pessoa = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<Contrato>> buscarContratosPessoa(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONTRATOS_PESSOA, Contrato.class)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }


    // Migrado de ContratoRepository.findContratoById (legado) - HQL original:
    // Select c from Contrato c left join fetch c.descontoCurso left join fetch c.taxaCurso left join fetch c.formaPagamento  where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.id = ?1 order by c.id desc
    public static final String SQL_FIND_CONTRATO_BY_ID =
            "SELECT c.* FROM edc_contrato c LEFT JOIN edc_desconto_curso left ON left.id = c.id_desconto_curso INNER JOIN edc_taxa_curso left ON left.id = c.id_taxa_curso LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<Contrato>> findContratoById(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_CONTRATO_BY_ID, Contrato.class)
                    .setParameter(1, id)
                    .getResultList());
    }


    // Migrado de ContratoRepository.findContratoCancelamentoById (legado) - HQL original:
    // Select c from Contrato c left join fetch c.cancelamento where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.id = ?1 order by c.id desc
    public static final String SQL_FIND_CONTRATO_CANCELAMENTO_BY_ID =
            "SELECT c.* FROM edc_contrato c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<Contrato>> findContratoCancelamentoById(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_CONTRATO_CANCELAMENTO_BY_ID, Contrato.class)
                    .setParameter(1, id)
                    .getResultList());
    }


    // Migrado de ContratoRepository.findContratoByIdOferecimento (legado) - HQL original:
    // Select c from Contrato c left join fetch c.oferecimentoInicio left join fetch c.oferecimentoFim  where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.id = ?1 order by c.id desc
    public static final String SQL_FIND_CONTRATO_BY_ID_OFERECIMENTO =
            "SELECT c.* FROM edc_contrato c LEFT JOIN edc_oferecimento_componente_curricular left ON left.id = c.id_oferecimento_inicio LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<Contrato>> findContratoByIdOferecimento(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_CONTRATO_BY_ID_OFERECIMENTO, Contrato.class)
                    .setParameter(1, id)
                    .getResultList());
    }


    // Migrado de ContratoRepository.findContratoByIdTestemunha (legado) - HQL original:
    // Select c from Contrato c left join fetch c.testemunha1 left join fetch c.testemunha2 left join fetch c.descontoCurso where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.id = ?1 order by c.id desc
    public static final String SQL_FIND_CONTRATO_BY_ID_TESTEMUNHA =
            "SELECT c.* FROM edc_contrato c LEFT JOIN bas_pessoa left ON left.id = c.id_testemunha1 INNER JOIN bas_pessoa left ON left.id = c.id_testemunha2 LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<Contrato>> findContratoByIdTestemunha(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_CONTRATO_BY_ID_TESTEMUNHA, Contrato.class)
                    .setParameter(1, id)
                    .getResultList());
    }


    // Migrado de ContratoRepository.buscarContratosPessoaParcelasNaoPagas (legado) - HQL original:
    // Select c from Contrato c where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.pessoa = ?1 order by c.id desc
    public static final String SQL_BUSCAR_CONTRATOS_PESSOA_PARCELAS_NAO_PAGAS =
            "SELECT c.* FROM edc_contrato c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id_pessoa = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<Contrato>> buscarContratosPessoaParcelasNaoPagas(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONTRATOS_PESSOA_PARCELAS_NAO_PAGAS, Contrato.class)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }


    // Migrado de ContratoRepository.buscarResponsaveisPessoa (legado) - HQL original:
    // Select distinct c.responsavel from Contrato c where c.pessoa = ?1 and c.responsavel is not null
    public static final String SQL_BUSCAR_RESPONSAVEIS_PESSOA =
            "SELECT DISTINCT c.id_responsavel FROM edc_contrato c WHERE c.id_pessoa = ?1 and c.id_responsavel is not null";

    public Uni<java.util.List<Object>> buscarResponsaveisPessoa(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_RESPONSAVEIS_PESSOA)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }


    // Migrado de ContratoRepository.autoCompleteContrato (legado) - HQL original:
    // select distinct c from Contrato c where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.pessoa in (?2) and  lower(c.curriculo.sucinto) like '%' || ?1 || '%' OR str(c.id) like '%' || ?1 || '%' OR  lower(c.curriculo.curso.nome) like '%' || ?1 || '%'
    public static final String SQL_AUTO_COMPLETE_CONTRATO =
            "SELECT DISTINCT c.* FROM edc_contrato c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel LEFT JOIN edc_curriculo j_c_curriculo ON j_c_curriculo.id = c.id_curso LEFT JOIN edc_curso j_j_c_curriculo_curso ON j_j_c_curriculo_curso.id = j_c_curriculo.id_curso WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id_pessoa in (?2) and lower(j_c_curriculo.sucinto) like '%' || ?1 || '%' OR CAST(c.id AS text) like '%' || ?1 || '%' OR lower(j_j_c_curriculo_curso.nome) like '%' || ?1 || '%' LIMIT 10";

    public Uni<java.util.List<Contrato>> autoCompleteContrato(String query, Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_CONTRATO, Contrato.class)
                    .setParameter(1, query)
                    .setParameter(2, pessoaId)
                    .getResultList());
    }


    // Migrado de ContratoRepository.buscarContratoPessoa (legado) - HQL original:
    // select distinct c from Contrato c where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.pessoa in (?1)
    public static final String SQL_BUSCAR_CONTRATO_PESSOA =
            "SELECT DISTINCT c.* FROM edc_contrato c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id_pessoa in (?1) LIMIT 10";

    public Uni<java.util.List<Contrato>> buscarContratoPessoa(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONTRATO_PESSOA, Contrato.class)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }


    // Migrado de ContratoRepository.autoCompleteAluno (legado) - HQL original:
    // select distinct p from Contrato c inner join c.pessoa p inner join p.unidades u  where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and  (u in (?2) or c.unidadeResponsavel in (?2)) and (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%')
    public static final String SQL_AUTO_COMPLETE_ALUNO =
            "SELECT DISTINCT p.* FROM edc_contrato c INNER JOIN bas_pessoa p ON p.id = c.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and (u in (?2) or c.id_unidade_resposavel in (?2)) and (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_p_pessoaFisica.cpf) like '%' || ?1 || '%') LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'Contrato'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompleteAluno(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALUNO)
                    .setParameter(1, query)
                    .setParameter(2, unidadesIds)
                    .getResultList());
    }

    public static final String SQL_AUTO_COMPLETE_ALUNO_NOME =
            "SELECT DISTINCT p.id, COALESCE(pf.nome, pj.nome_fantasia, '') FROM edc_contrato c " +
            "INNER JOIN bas_pessoa p ON p.id = c.id_pessoa " +
            "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
            "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
            "WHERE (lower(COALESCE(pf.nome, '')) like '%' || ?1 || '%' " +
            "OR lower(COALESCE(pj.nome_fantasia, '')) like '%' || ?1 || '%' " +
            "OR pf.cpf like '%' || ?1 || '%' OR pj.cnpj like '%' || ?1 || '%') " +
            "ORDER BY COALESCE(pf.nome, pj.nome_fantasia, '') LIMIT 20";

    public Uni<java.util.List<Object>> autoCompleteAlunoNome(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALUNO_NOME)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de ContratoRepository.autoCompleteAlunoPagamentoPendente (legado) - HQL original:
    // select distinct p from Contrato c inner join c.pessoa p inner join p.unidades u  where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and  (u in (?2) or c.unidadeResponsavel in (?2)) and (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%') and exists(select par from Parcela par where par.dataPagamento is null and par.dataCancelamento is null and par.contrato = c)
    public static final String SQL_AUTO_COMPLETE_ALUNO_PAGAMENTO_PENDENTE =
            "SELECT DISTINCT p.* FROM edc_contrato c INNER JOIN bas_pessoa p ON p.id = c.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and (u in (?2) or c.id_unidade_resposavel in (?2)) and (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_p_pessoaFisica.cpf) like '%' || ?1 || '%') and exists(select par from Parcela par where par.dataPagamento is null and par.dataCancelamento is null and par.contrato = c) LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'Contrato'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompleteAlunoPagamentoPendente(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALUNO_PAGAMENTO_PENDENTE)
                    .setParameter(1, query)
                    .setParameter(2, unidadesIds)
                    .getResultList());
    }


    // Migrado de ContratoRepository.autoCompleteAlunoPagamentoPendenteUnidade (legado) - HQL original:
    // select distinct p from Contrato c inner join c.pessoa p inner join p.unidades u  where  c.unidade.ativo = true and c.unidadeResponsavel = ?2 and  (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%') and exists(select par from Parcela par where par.dataPagamento is null and par.dataCancelamento is null and par.contrato = c)
    public static final String SQL_AUTO_COMPLETE_ALUNO_PAGAMENTO_PENDENTE_UNIDADE =
            "SELECT DISTINCT p.* FROM edc_contrato c INNER JOIN bas_pessoa p ON p.id = c.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id WHERE j_c_unidade.fl_ativo = true and c.id_unidade_resposavel = ?2 and (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_p_pessoaFisica.cpf) like '%' || ?1 || '%') and exists(select par from Parcela par where par.dataPagamento is null and par.dataCancelamento is null and par.contrato = c) LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'Contrato'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompleteAlunoPagamentoPendenteUnidade(String query, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALUNO_PAGAMENTO_PENDENTE_UNIDADE)
                    .setParameter(1, query)
                    .setParameter(2, unidadeId)
                    .getResultList());
    }


    // Migrado de ContratoRepository.validaAluno (legado) - HQL original:
    // select c from Contrato c where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.pessoa = ?1
    public static final String SQL_VALIDA_ALUNO =
            "SELECT c.* FROM edc_contrato c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id_pessoa = ?1 LIMIT 10";

    public Uni<java.util.List<Contrato>> validaAluno(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VALIDA_ALUNO, Contrato.class)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }


    // Migrado de ContratoRepository.ultimoContratoSemContrato (legado) - HQL original:
    // select c from Contrato c where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.pessoa = ?1 order by c.id desc
    public static final String SQL_ULTIMO_CONTRATO_SEM_CONTRATO =
            "SELECT c.* FROM edc_contrato c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel WHERE j_c_unidade.fl_ativo = true and j_c_unidadeResponsavel.fl_ativo = true and c.id_pessoa = ?1 ORDER BY c.id desc LIMIT 10";

    public Uni<java.util.List<Contrato>> ultimoContratoSemContrato(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ULTIMO_CONTRATO_SEM_CONTRATO, Contrato.class)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }

}