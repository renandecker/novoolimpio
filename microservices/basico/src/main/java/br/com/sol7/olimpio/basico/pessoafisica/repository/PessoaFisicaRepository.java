package br.com.sol7.olimpio.basico.pessoafisica.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoa.entity.Pessoa;
import br.com.sol7.olimpio.basico.pessoafisica.entity.PessoaFisica;

@ApplicationScoped
public class PessoaFisicaRepository implements PanacheRepository<PessoaFisica> {

    // Migrado de PessoaFisicaRepository.autoComplete (legado) - HQL original:
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


    // Migrado de PessoaFisicaRepository.autoCompleteTodos (legado) - HQL original:
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


    // Migrado de PessoaFisicaRepository.autoCompleteAcao (legado) - HQL original:
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


    // Migrado de PessoaFisicaRepository.buscarPessoaComCpf (legado) - HQL original:
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


    // Migrado de PessoaFisicaRepository.autoCompleteTestemunha (legado) - HQL original:
    // select  p from Usuario usu inner join usu.pessoa p inner join p.unidades u where usu.ativo = true and  u in (?2) and  (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR p.pessoaFisica.cpf like '%' || ?1 || '%' OR  lower(p.pessoaFisica.nome) like '%' || ?1 || '%' or p.pessoaFisica.cpf like '%' || ?1 || '%' or replace(replace(p.pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' or lower(p.pessoaFisica.nome||p.pessoaFisica.cpf) like '%' || lower(?1) || '%' or  lower(p.pessoaFisica.nome||' ('||p.pessoaFisica.cpf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(p.pessoaFisica.nome||' '||p.pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%' )  AND u.ativo = true and p not in (select pr.pessoa from Professor pr) order by p.pessoaFisica.nome
    public static final String SQL_AUTO_COMPLETE_TESTEMUNHA =
            "SELECT p.* FROM bas_usuario usu INNER JOIN bas_pessoa p ON p.id = usu.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id WHERE usu.fl_ativo = true and u in (?2) and (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR j_p_pessoaFisica.cpf like '%' || ?1 || '%' OR lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' or j_p_pessoaFisica.cpf like '%' || ?1 || '%' or replace(replace(j_p_pessoaFisica.cpf,'.',''),'-','') like '%' || ?1 || '%' or lower(j_p_pessoaFisica.nome||j_p_pessoaFisica.cpf) like '%' || lower(?1) || '%' or lower(j_p_pessoaFisica.nome||' ('||j_p_pessoaFisica.cpf||')') like '%' || lower(?1) || '%' or replace(replace(lower(j_p_pessoaFisica.nome||' '||j_p_pessoaFisica.cpf),'(',''),')','') like '%' || lower(?1) || '%' ) AND u.fl_ativo = true and p not in (select pr.pessoa from Professor pr) ORDER BY j_p_pessoaFisica.nome LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'PessoaFisica'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompleteTestemunha(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_TESTEMUNHA)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }

}