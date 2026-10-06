package br.com.sol7.olimpio.basico.pessoafisica.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoa.entity.Pessoa;
import br.com.sol7.olimpio.basico.pessoafisica.entity.PessoaFisica;

@ApplicationScoped
public class PessoaFisicaRepository implements PanacheRepository<PessoaFisica> {

    // select distinct p from Pessoa p inner join p.unidades u where u in (?2) and  (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%' OR  lower(p.pessoaFisica.nome) like '%' || ?1 || '%' or p.pessoaFisica.cpf like '%' || ?1 || '%' or replace(replace(p.pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' or lower(p.pessoaFisica.nome||p.pessoaFisica.cpf) like '%' || lower(?1) || '%' or  lower(p.pessoaFisica.nome||' ('||p.pessoaFisica.cpf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(p.pessoaFisica.nome||' '||p.pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%' )  and  u.ativo = true AND p not in (select pr.pessoa from Professor pr)
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT p.* FROM bas_pessoa p INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id WHERE u in (?2) and (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_p_pessoaFisica.cpf) like '%' || ?1 || '%' OR lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' or j_p_pessoaFisica.cpf like '%' || ?1 || '%' or replace(replace(j_p_pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' or lower(j_p_pessoaFisica.nome||j_p_pessoaFisica.cpf) like '%' || lower(?1) || '%' or lower(j_p_pessoaFisica.nome||' ('||j_p_pessoaFisica.cpf||')') like '%' || lower(?1) || '%' or replace(replace(lower(j_p_pessoaFisica.nome||' '||j_p_pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%' ) and u.fl_ativo = true AND p not in (select pr.pessoa from Professor pr) LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaFisica'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoComplete(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // select distinct p from Pessoa p inner join p.unidades u where u in (?2) and  (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%' OR  lower(p.pessoaFisica.nome) like '%' || ?1 || '%' or p.pessoaFisica.cpf like '%' || ?1 || '%' or replace(replace(p.pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' or lower(p.pessoaFisica.nome||p.pessoaFisica.cpf) like '%' || lower(?1) || '%' or  lower(p.pessoaFisica.nome||' ('||p.pessoaFisica.cpf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(p.pessoaFisica.nome||' '||p.pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%' ) and  u.ativo = true
    public static final String SQL_AUTO_COMPLETE_TODOS =
            "SELECT DISTINCT p.* FROM bas_pessoa p INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id WHERE u in (?2) and (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_p_pessoaFisica.cpf) like '%' || ?1 || '%' OR lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' or j_p_pessoaFisica.cpf like '%' || ?1 || '%' or replace(replace(j_p_pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' or lower(j_p_pessoaFisica.nome||j_p_pessoaFisica.cpf) like '%' || lower(?1) || '%' or lower(j_p_pessoaFisica.nome||' ('||j_p_pessoaFisica.cpf||')') like '%' || lower(?1) || '%' or replace(replace(lower(j_p_pessoaFisica.nome||' '||j_p_pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%' ) and u.fl_ativo = true LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaFisica'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompleteTodos(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_TODOS)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // Variante sem filtro por unidade, projeta somente o id (contrato Uni<List<Long>> do service).
    // Sem a juncao com bas_unidade nao ha parametro de unidades disponivel; segue o mesmo formato
    // ja usado por autoCompleteTestemunha(String), tambem sem filtro de unidade.
    // NOT EXISTS em vez de NOT IN: id_pessoa nulo em edc_professor zeraria o NOT IN inteiro.
    public static final String SQL_AUTO_COMPLETE_IDS =
            "SELECT DISTINCT p.id FROM bas_pessoa p " +
            "LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id " +
            "WHERE (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' " +
            "OR j_p_pessoaFisica.cpf like '%' || ?1 || '%' " +
            "OR replace(replace(j_p_pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' " +
            "OR lower(j_p_pessoaFisica.nome||j_p_pessoaFisica.cpf) like '%' || lower(?1) || '%' " +
            "OR lower(j_p_pessoaFisica.nome||' ('||j_p_pessoaFisica.cpf||')') like '%' || lower(?1) || '%' " +
            "OR replace(replace(lower(j_p_pessoaFisica.nome||' '||j_p_pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%') " +
            "AND NOT EXISTS (SELECT 1 FROM edc_professor pr WHERE pr.id_pessoa = p.id) LIMIT 10";

    // Mesma consulta sem a exclusao de professor (equivalente ao SQL_AUTO_COMPLETE_TODOS original).
    public static final String SQL_AUTO_COMPLETE_TODOS_IDS =
            "SELECT DISTINCT p.id FROM bas_pessoa p " +
            "LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id " +
            "WHERE (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' " +
            "OR j_p_pessoaFisica.cpf like '%' || ?1 || '%' " +
            "OR replace(replace(j_p_pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' " +
            "OR lower(j_p_pessoaFisica.nome||j_p_pessoaFisica.cpf) like '%' || lower(?1) || '%' " +
            "OR lower(j_p_pessoaFisica.nome||' ('||j_p_pessoaFisica.cpf||')') like '%' || lower(?1) || '%' " +
            "OR replace(replace(lower(j_p_pessoaFisica.nome||' '||j_p_pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%') LIMIT 10";

    public Uni<java.util.List<Long>> autoComplete(String query) {
        return ids(SQL_AUTO_COMPLETE_IDS, query);
    }

    public Uni<java.util.List<Long>> autoCompleteTodos(String query) {
        return ids(SQL_AUTO_COMPLETE_TODOS_IDS, query);
    }

    private Uni<java.util.List<Long>> ids(String sql, String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, query)
                        .getResultList())
                .map(rows -> rows.stream()
                        .map(row -> row instanceof Number n ? n.longValue() : Long.valueOf(row.toString()))
                        .toList());
    }


    // select p from Pessoa p inner join p.unidades u where (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR str(p.id) = ?1) and u.ativo = true order by p.pessoaFisica.nome
    public static final String SQL_AUTO_COMPLETE_ACAO =
            "SELECT p.* FROM bas_pessoa p INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id WHERE (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1) and u.fl_ativo = true ORDER BY j_p_pessoaFisica.nome LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaFisica'.
    public Uni<java.util.List<Pessoa>> autoCompleteAcao(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ACAO, Pessoa.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // select p from PessoaFisica pf inner join pf.pessoa p inner join p.unidades u where u.ativo = true and pf.cpf = ?1
    public static final String SQL_BUSCAR_PESSOA_COM_CPF =
            "SELECT p.* FROM bas_pessoa_fisica pf INNER JOIN bas_pessoa p ON p.id = pf.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade WHERE u.fl_ativo = true and pf.cpf = ?1 LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaFisica'.
    public Uni<java.util.List<Pessoa>> buscarPessoaComCpf(String cpf) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PESSOA_COM_CPF, Pessoa.class)
                        .setParameter(1, cpf)
                        .getResultList());
    }


    // select  p from Usuario usu inner join usu.pessoa p inner join p.unidades u where usu.ativo = true and  u in (?2) and  (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' ...) AND u.ativo = true and p not in (select pr.pessoa from Professor pr) order by p.pessoaFisica.nome
    // Adaptado para microserviço: retorna PessoaFisica cujo Pessoa possui Usuario ativo.
    // Filtro por unidade omitido (depende do usuário logado); filtra apenas por nome/cpf.
    // ItemLabel de referência (legado abasMatricula.xhtml): "#{pessoa.pessoaFisica.nome} (#{pessoa.pessoaFisica.cpf})"
    public static final String SQL_AUTO_COMPLETE_TESTEMUNHA =
            "SELECT pf.* FROM bas_pessoa_fisica pf " +
            "INNER JOIN bas_pessoa p ON p.id = pf.id_pessoa " +
            "INNER JOIN bas_usuario usu ON usu.id_pessoa = p.id " +
            "WHERE usu.fl_ativo = true " +
            "AND (lower(pf.nome) LIKE ?1 OR pf.cpf LIKE ?2 OR replace(replace(pf.cpf,'.',''),'-','') LIKE ?3 " +
            "OR lower(pf.nome || ' (' || COALESCE(pf.cpf,'' ) || ')') LIKE ?1) " +
            "ORDER BY pf.nome LIMIT 10";

    public Uni<java.util.List<PessoaFisica>> autoCompleteTestemunha(String query) {
        String q = query == null ? "" : query.trim().toLowerCase();
        if (q.isEmpty()) {
            return PessoaFisica.find("order by nome", io.quarkus.panache.common.Page.of(0, 10)).list();
        }
        String like = "%" + q + "%";
        String clean = q.replace(".", "").replace("-", "").replace("(", "").replace(")", "").trim();
        String likeClean = "%" + clean + "%";
        return PessoaFisica.find("lower(nome) like ?1 or cpf like ?2 or replace(replace(cpf, '.', ''), '-', '') like ?3 order by nome", like, like, likeClean)
                .page(io.quarkus.panache.common.Page.of(0, 10))
                .list();
    }

    // Mantido por compatibilidade com chamadas antigas (filtro por unidades).
    // Delegar para a versão sem filtro de unidade.
    public Uni<java.util.List<Object>> autoCompleteTestemunha(String query, List<Long> unidadesIds) {
        return autoCompleteTestemunha(query).map(list -> (java.util.List<Object>) (java.util.List<?>) list);
    }



    // select pf from PessoaFisica pf where pf.pessoaId = ?1
    public static final String SQL_FIND_BY_PESSOA_ID =
            "SELECT * FROM bas_pessoa_fisica WHERE id_pessoa = ?1";

    public Uni<PessoaFisica> findByPessoaId(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_BY_PESSOA_ID, PessoaFisica.class)
                        .setParameter(1, pessoaId)
                        .getSingleResultOrNull());
    }

}
