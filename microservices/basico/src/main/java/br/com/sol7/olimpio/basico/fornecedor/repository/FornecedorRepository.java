package br.com.sol7.olimpio.basico.fornecedor.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.fornecedor.entity.Fornecedor;

@ApplicationScoped
public class FornecedorRepository implements PanacheRepository<Fornecedor> {

    // Migrado de FornecedorRepository.autoComplete (legado) - HQL original:
    // select distinct f from Fornecedor f inner join f.pessoa p inner join  p.unidades u where u IN (?2) and (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%')  order by p.pessoaJuridica.nomeFantasia
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT f.* FROM bas_fornecedor f INNER JOIN bas_pessoa p ON p.id = f.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_juridica j_p_pessoaJuridica ON j_p_pessoaJuridica.id_pessoa = p.id WHERE u IN (?2) and (lower(j_p_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.razao_social) like '%' || ?1 || '%') ORDER BY j_p_pessoaJuridica.nome_fantasia LIMIT 10";

    public Uni<java.util.List<Fornecedor>> autoComplete(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Fornecedor.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // Migrado de FornecedorRepository.autoCompletePessoa (legado) - HQL original:
    // select distinct p from Pessoa p inner join  p.unidades u where u IN (?2) and (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%')  order by p.pessoaJuridica.nomeFantasia
    public static final String SQL_AUTO_COMPLETE_PESSOA =
            "SELECT DISTINCT p.* FROM bas_pessoa p INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_juridica j_p_pessoaJuridica ON j_p_pessoaJuridica.id_pessoa = p.id WHERE u IN (?2) and (lower(j_p_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.razao_social) like '%' || ?1 || '%') ORDER BY j_p_pessoaJuridica.nome_fantasia LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'Fornecedor'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompletePessoa(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PESSOA)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // Migrado de FornecedorRepository.autoCompleteSOmenteUnidade (legado) - HQL original:
    // select distinct p from PessoaJuridica f inner join f.pessoa p inner join  p.unidades u where u IN (?1)
    public static final String SQL_AUTO_COMPLETE_S_OMENTE_UNIDADE =
            "SELECT DISTINCT p.* FROM bas_pessoa_juridica f INNER JOIN bas_pessoa p ON p.id = f.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade WHERE u IN (?1) LIMIT 10";

    // Atencao: a query original seleciona 'Pessoa', nao 'Fornecedor'.
    // Se 'Pessoa' existir como entidade neste microsservico, troque Object por Pessoa.class abaixo.
    public Uni<java.util.List<Object>> autoCompleteSOmenteUnidade(List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_S_OMENTE_UNIDADE)
                        .setParameter(1, unidadesIds)
                        .getResultList());
    }


    // Migrado de FornecedorRepository.buscaFornecedorAtivos (legado) - HQL original:
    // select  f from Fornecedor f where f.ativo = true
    public static final String SQL_BUSCA_FORNECEDOR_ATIVOS =
            "SELECT f.* FROM bas_fornecedor f WHERE f.ativo = true";

    public Uni<java.util.List<Fornecedor>> buscaFornecedorAtivos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_FORNECEDOR_ATIVOS, Fornecedor.class)

                        .getResultList());
    }


    // Migrado de FornecedorRepository.autoCompleteFornecedor (legado) - HQL original:
    // select distinct f from Fornecedor f inner join f.pessoa p inner join  p.unidades u where u IN (?2) and (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%')  order by p.pessoaJuridica.nomeFantasia
    public static final String SQL_AUTO_COMPLETE_FORNECEDOR =
            "SELECT DISTINCT f.* FROM bas_fornecedor f INNER JOIN bas_pessoa p ON p.id = f.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade LEFT JOIN bas_pessoa_juridica j_p_pessoaJuridica ON j_p_pessoaJuridica.id_pessoa = p.id WHERE u IN (?2) and (lower(j_p_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (j_p_pessoaJuridica.razao_social) like '%' || ?1 || '%') ORDER BY j_p_pessoaJuridica.nome_fantasia LIMIT 10";

    public Uni<java.util.List<Fornecedor>> autoCompleteFornecedor(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_FORNECEDOR, Fornecedor.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // Migrado de FornecedorRepository.autoCompleteSOmenteUnidadeFornecedor (legado) - HQL original:
    // select distinct f from Fornecedor f inner join f.pessoa p inner join  p.unidades u where u IN (?1)
    public static final String SQL_AUTO_COMPLETE_S_OMENTE_UNIDADE_FORNECEDOR =
            "SELECT DISTINCT f.* FROM bas_fornecedor f INNER JOIN bas_pessoa p ON p.id = f.id_pessoa INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade WHERE u IN (?1) LIMIT 10";

    public Uni<java.util.List<Fornecedor>> autoCompleteSOmenteUnidadeFornecedor(List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_S_OMENTE_UNIDADE_FORNECEDOR, Fornecedor.class)
                        .setParameter(1, unidadesIds)
                        .getResultList());
    }

}