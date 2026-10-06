package br.com.sol7.olimpio.basico.pessoajuridica.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoa.entity.Pessoa;
import br.com.sol7.olimpio.basico.pessoajuridica.entity.PessoaJuridica;

@ApplicationScoped
public class PessoaJuridicaRepository implements PanacheRepository<PessoaJuridica> {

    // select distinct  p from Pessoa p left join p.unidades u where u IN (?2) and  (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR  lower(p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%' or replace(replace(p.pessoaJuridica.cnpj,'.',''),'-','') like '%' || ?1 || '%' or  lower(p.pessoaJuridica.nomeFantasia||p.pessoaJuridica.cnpj) like '%' || lower(?1) || '%' or  lower(p.pessoaJuridica.nomeFantasia||' ('||p.pessoaJuridica.cnpj||')') like '%' || lower(?1) || '%' or  replace(replace(lower(p.pessoaJuridica.nomeFantasia||' '||p.pessoaJuridica.cnpj),'(',''),')','') like '%' || lower(?1) || '%' )  AND u.ativo = true and p not in (select pr.pessoa from Professor pr)
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT p.* FROM bas_pessoa p LEFT JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id LEFT JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_juridica j_p_pessoaJuridica ON j_p_pessoaJuridica.id_pessoa = p.id WHERE u IN (?2) and (lower(j_p_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.cnpj) like '%' || ?1 || '%' OR lower(j_p_pessoaJuridica.razao_social) like '%' || ?1 || '%' or replace(replace(j_p_pessoaJuridica.cnpj,'.',''),'-','') like '%' || ?1 || '%' or lower(j_p_pessoaJuridica.nome_fantasia||j_p_pessoaJuridica.cnpj) like '%' || lower(?1) || '%' or lower(j_p_pessoaJuridica.nome_fantasia||' ('||j_p_pessoaJuridica.cnpj||')') like '%' || lower(?1) || '%' or replace(replace(lower(j_p_pessoaJuridica.nome_fantasia||' '||j_p_pessoaJuridica.cnpj),'(',''),')','') like '%' || lower(?1) || '%' ) AND u.fl_ativo = true and p not in (select pr.pessoa from Professor pr) LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaJuridica'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoComplete(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // select distinct  p from Pessoa p left join p.unidades u where u IN (?2) and  (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR  lower(p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%' or replace(replace(p.pessoaJuridica.cnpj,'.',''),'-','') like '%' || ?1 || '%' or lower(p.pessoaJuridica.nomeFantasia||p.pessoaJuridica.cnpj) like '%' || lower(?1) || '%' or  lower(p.pessoaJuridica.nomeFantasia||' ('||p.pessoaJuridica.cnpj||')') like '%' || lower(?1) || '%' or  replace(replace(lower(p.pessoaJuridica.nomeFantasia||' '||p.pessoaJuridica.cnpj),'(',''),')','') like '%' || lower(?1) || '%' )  AND u.ativo = true and p not in (select pr.pessoa from Professor pr)
    public static final String SQL_AUTO_COMPLETE_TODOS =
            "SELECT DISTINCT p.* FROM bas_pessoa p LEFT JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id LEFT JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_juridica j_p_pessoaJuridica ON j_p_pessoaJuridica.id_pessoa = p.id WHERE u IN (?2) and (lower(j_p_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.cnpj) like '%' || ?1 || '%' OR lower(j_p_pessoaJuridica.razao_social) like '%' || ?1 || '%' or replace(replace(j_p_pessoaJuridica.cnpj,'.',''),'-','') like '%' || ?1 || '%' or lower(j_p_pessoaJuridica.nome_fantasia||j_p_pessoaJuridica.cnpj) like '%' || lower(?1) || '%' or lower(j_p_pessoaJuridica.nome_fantasia||' ('||j_p_pessoaJuridica.cnpj||')') like '%' || lower(?1) || '%' or replace(replace(lower(j_p_pessoaJuridica.nome_fantasia||' '||j_p_pessoaJuridica.cnpj),'(',''),')','') like '%' || lower(?1) || '%' ) AND u.fl_ativo = true and p not in (select pr.pessoa from Professor pr) LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaJuridica'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompleteTodos(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_TODOS)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // Variante sem filtro por unidade, projeta somente o id (contrato Uni<List<Long>> do service).
    // Sem a juncao com bas_unidade nao ha parametro de unidades disponivel.
    // NOT EXISTS em vez de NOT IN: id_pessoa nulo em edc_professor zeraria o NOT IN inteiro.
    public static final String SQL_AUTO_COMPLETE_IDS =
            "SELECT DISTINCT p.id FROM bas_pessoa p " +
            "LEFT JOIN bas_pessoa_juridica j_p_pessoaJuridica ON j_p_pessoaJuridica.id_pessoa = p.id " +
            "WHERE (lower(j_p_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' " +
            "OR j_p_pessoaJuridica.cnpj like '%' || ?1 || '%' " +
            "OR lower(j_p_pessoaJuridica.razao_social) like '%' || ?1 || '%' " +
            "OR replace(replace(j_p_pessoaJuridica.cnpj,'.',''),'-','') like '%' || ?1 || '%' " +
            "OR lower(j_p_pessoaJuridica.nome_fantasia||j_p_pessoaJuridica.cnpj) like '%' || lower(?1) || '%' " +
            "OR lower(j_p_pessoaJuridica.nome_fantasia||' ('||j_p_pessoaJuridica.cnpj||')') like '%' || lower(?1) || '%' " +
            "OR replace(replace(lower(j_p_pessoaJuridica.nome_fantasia||' '||j_p_pessoaJuridica.cnpj),'(',''),')','') like '%' || lower(?1) || '%') " +
            "AND NOT EXISTS (SELECT 1 FROM edc_professor pr WHERE pr.id_pessoa = p.id) LIMIT 10";

    // Mesma consulta sem a exclusao de professor (equivalente ao SQL_AUTO_COMPLETE_TODOS original).
    public static final String SQL_AUTO_COMPLETE_TODOS_IDS =
            "SELECT DISTINCT p.id FROM bas_pessoa p " +
            "LEFT JOIN bas_pessoa_juridica j_p_pessoaJuridica ON j_p_pessoaJuridica.id_pessoa = p.id " +
            "WHERE (lower(j_p_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' " +
            "OR j_p_pessoaJuridica.cnpj like '%' || ?1 || '%' " +
            "OR lower(j_p_pessoaJuridica.razao_social) like '%' || ?1 || '%' " +
            "OR replace(replace(j_p_pessoaJuridica.cnpj,'.',''),'-','') like '%' || ?1 || '%' " +
            "OR lower(j_p_pessoaJuridica.nome_fantasia||j_p_pessoaJuridica.cnpj) like '%' || lower(?1) || '%' " +
            "OR lower(j_p_pessoaJuridica.nome_fantasia||' ('||j_p_pessoaJuridica.cnpj||')') like '%' || lower(?1) || '%' " +
            "OR replace(replace(lower(j_p_pessoaJuridica.nome_fantasia||' '||j_p_pessoaJuridica.cnpj),'(',''),')','') like '%' || lower(?1) || '%') LIMIT 10";

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


    // select p from PessoaJuridica pj inner join pj.pessoa p left join p.unidades u where u.ativo = true and pj.cnpj = ?1
    public static final String SQL_BUSCAR_PESSOA_COM_CNPJ =
            "SELECT p.* FROM bas_pessoa_juridica pj INNER JOIN bas_pessoa p ON p.id = pj.id_pessoa LEFT JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id LEFT JOIN bas_unidade u ON u.id = p_u_jt.id_unidade WHERE u.fl_ativo = true and pj.cnpj = ?1";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaJuridica'.
    public Uni<java.util.List<Pessoa>> buscarPessoaComCnpj(String cnpj) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PESSOA_COM_CNPJ, Pessoa.class)
                        .setParameter(1, cnpj)
                        .getResultList());
    }

}