package br.com.sol7.olimpio.basico.pessoa.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoa.entity.Pessoa;

@ApplicationScoped
public class PessoaRepository implements PanacheRepository<Pessoa> {

    // Select p from Pessoa p left join fetch p.unidades u where  p = ?1
    public static final String SQL_BUSCAR_PESSOA_COM_UNIDADES =
            "SELECT p.* FROM bas_pessoa p LEFT JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id LEFT JOIN bas_unidade u ON u.id = p_u_jt.id_unidade WHERE p.id = ?1";

    public Uni<java.util.List<Pessoa>> buscarPessoaComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PESSOA_COM_UNIDADES, Pessoa.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // select u from Usuario u left join fetch u.unidades where trim(u.pessoa.pessoaFisica.nome) = ?1
    public static final String SQL_EXISTENCIA_USUARIO_COM_NOME =
            "SELECT u.* FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_u_pessoa_pessoaFisica ON j_j_u_pessoa_pessoaFisica.id_pessoa = j_u_pessoa.id WHERE trim(j_j_u_pessoa_pessoaFisica.nome) = ?1";

    // Atencao: a query original seleciona 'Usuario', nao 'Pessoa'.
    // Se 'Usuario' existir como entidade neste microsservico, troque Object por Usuario.class abaixo.
    public Uni<java.util.List<Object>> existenciaUsuarioComNome(String nome) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_NOME)
                        .setParameter(1, nome)
                        .getResultList());
    }


    // select p.pessoa from PessoaFisica p where trim(p.nome) = ?1
    public static final String SQL_EXISTENCIA_PESSOA_COM_NOME =
            "SELECT p.id_pessoa FROM bas_pessoa_fisica p WHERE trim(p.nome) = ?1";

    public Uni<java.util.List<Object>> existenciaPessoaComNome(String nome) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_NOME)
                        .setParameter(1, nome)
                        .getResultList());
    }


    // select u from Usuario u where u.pessoa.pessoaFisica.rg = ?1
    public static final String SQL_EXISTENCIA_USUARIO_COM_RG =
            "SELECT u.* FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_u_pessoa_pessoaFisica ON j_j_u_pessoa_pessoaFisica.id_pessoa = j_u_pessoa.id WHERE j_j_u_pessoa_pessoaFisica.rg = ?1";

    // Atencao: a query original seleciona 'Usuario', nao 'Pessoa'.
    // Se 'Usuario' existir como entidade neste microsservico, troque Object por Usuario.class abaixo.
    public Uni<java.util.List<Object>> existenciaUsuarioComRg(String nome) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_RG)
                        .setParameter(1, nome)
                        .getResultList());
    }


    // select p.pessoa from PessoaFisica p where p.rg = ?1
    public static final String SQL_EXISTENCIA_PESSOA_COM_RG =
            "SELECT p.id_pessoa FROM bas_pessoa_fisica p WHERE p.rg = ?1";

    public Uni<java.util.List<Object>> existenciaPessoaComRg(String nome) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_RG)
                        .setParameter(1, nome)
                        .getResultList());
    }


    // select p.pessoa from PessoaFisica p where p.rg = ?1 and p.pessoa.id <> ?2
    public static final String SQL_EXISTENCIA_PESSOA_COM_RG_COM_ID =
            "SELECT p.id_pessoa FROM bas_pessoa_fisica p LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa WHERE p.rg = ?1 and j_p_pessoa.id <> ?2";

    public Uni<java.util.List<Object>> existenciaPessoaComRg(String nome, Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_RG_COM_ID)
                        .setParameter(1, nome)
                        .setParameter(2, id)
                        .getResultList());
    }


    // select u from Usuario u where u.pessoa.pessoaFisica.cpf = ?1
    public static final String SQL_EXISTENCIA_USUARIO_COM_CPF =
            "SELECT u.* FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_u_pessoa_pessoaFisica ON j_j_u_pessoa_pessoaFisica.id_pessoa = j_u_pessoa.id WHERE j_j_u_pessoa_pessoaFisica.cpf = ?1";

    // Atencao: a query original seleciona 'Usuario', nao 'Pessoa'.
    // Se 'Usuario' existir como entidade neste microsservico, troque Object por Usuario.class abaixo.
    public Uni<java.util.List<Object>> existenciaUsuarioComCpf(String cpf) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_CPF)
                        .setParameter(1, cpf)
                        .getResultList());
    }


    // select p.pessoa from PessoaFisica p where p.cpf = ?1
    public static final String SQL_EXISTENCIA_PESSOA_COM_CPF =
            "SELECT p.id_pessoa FROM bas_pessoa_fisica p WHERE p.cpf = ?1";

    public Uni<java.util.List<Object>> existenciaPessoaComCpf(String cpf) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_CPF)
                        .setParameter(1, cpf)
                        .getResultList());
    }


    // select p.pessoa from PessoaFisica p where p.cpf = ?1 and p.pessoa.id <> ?2
    public static final String SQL_EXISTENCIA_PESSOA_COM_CPF_COM_ID =
            "SELECT p.id_pessoa FROM bas_pessoa_fisica p LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa WHERE p.cpf = ?1 and j_p_pessoa.id <> ?2";

    public Uni<java.util.List<Object>> existenciaPessoaComCpf(String cpf, Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_CPF_COM_ID)
                        .setParameter(1, cpf)
                        .setParameter(2, id)
                        .getResultList());
    }


    // select p.pessoa from PessoaJuridica p where p.cnpj = ?1  and p.pessoa.id <> ?2
    public static final String SQL_EXISTENCIA_PESSOA_COM_CNPJ =
            "SELECT p.id_pessoa FROM bas_pessoa_juridica p LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa WHERE p.cnpj = ?1 and j_p_pessoa.id <> ?2";

    public Uni<java.util.List<Object>> existenciaPessoaComCnpj(String cnpj, Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_CNPJ)
                        .setParameter(1, cnpj)
                        .setParameter(2, id)
                        .getResultList());
    }


    // select p.pessoa from PessoaJuridica p where p.cnpj = ?1
    public static final String SQL_EXISTENCIA_PESSOA_COM_CNPJ_SEM_ID =
            "SELECT p.id_pessoa FROM bas_pessoa_juridica p WHERE p.cnpj = ?1";

    public Uni<java.util.List<Object>> existenciaPessoaComCnpj(String cnpj) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_CNPJ_SEM_ID)
                        .setParameter(1, cnpj)
                        .getResultList());
    }


    // select p.pessoa from PessoaJuridica p where trim(lower(p.razaoSocial)) = ?1 and p.pessoa.id <> ?2
    public static final String SQL_EXISTENCIA_PESSOA_COM_RAZAO_SOCIAL =
            "SELECT p.id_pessoa FROM bas_pessoa_juridica p LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa WHERE trim(lower(p.razao_social)) = ?1 and j_p_pessoa.id <> ?2";

    public Uni<java.util.List<Object>> existenciaPessoaComRazaoSocial(String nome, Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_RAZAO_SOCIAL)
                        .setParameter(1, nome)
                        .setParameter(2, id)
                        .getResultList());
    }


    // select u from Usuario u where u.pessoa.email = ?1
    public static final String SQL_EXISTENCIA_USUARIO_COM_EMAIL =
            "SELECT u.* FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa WHERE j_u_pessoa.email = ?1";

    // Atencao: a query original seleciona 'Usuario', nao 'Pessoa'.
    // Se 'Usuario' existir como entidade neste microsservico, troque Object por Usuario.class abaixo.
    public Uni<java.util.List<Object>> existenciaUsuarioComEmail(String email) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_EMAIL)
                        .setParameter(1, email)
                        .getResultList());
    }


    // select p.pessoa from PessoaFisica p where p.pessoa.email = ?1
    public static final String SQL_EXISTENCIA_PESSOA_COM_EMAIL =
            "SELECT p.id_pessoa FROM bas_pessoa_fisica p LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa WHERE j_p_pessoa.email = ?1";

    public Uni<java.util.List<Object>> existenciaPessoaComEmail(String email) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_EMAIL)
                        .setParameter(1, email)
                        .getResultList());
    }


    // select p.pessoa from PessoaFisica p where p.pessoa.email = ?1 and p.pessoa.id <> ?2
    public static final String SQL_EXISTENCIA_PESSOA_COM_EMAIL_COM_ID =
            "SELECT p.id_pessoa FROM bas_pessoa_fisica p LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa WHERE j_p_pessoa.email = ?1 and j_p_pessoa.id <> ?2";

    public Uni<java.util.List<Object>> existenciaPessoaComEmail(String email, Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_PESSOA_COM_EMAIL_COM_ID)
                        .setParameter(1, email)
                        .setParameter(2, id)
                        .getResultList());
    }


    // select distinct p from Pessoa p inner join p.unidades u where u = ?1 order by p.id desc
    public static final String SQL_PESSOA_COM_UNIDADES =
            "SELECT DISTINCT p.* FROM bas_pessoa p INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade WHERE u.id = ?1 ORDER BY p.id desc";

    public Uni<java.util.List<Pessoa>> pessoaComUnidades(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_PESSOA_COM_UNIDADES, Pessoa.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // select distinct p from Pessoa p inner join p.unidades u where u in (?1) order by p.id desc
    public static final String SQL_BUSCAR_PESSOA_POR_UNIDADES =
            "SELECT DISTINCT p.* FROM bas_pessoa p INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade WHERE u in (?1) ORDER BY p.id desc";

    public Uni<java.util.List<Pessoa>> buscarPessoaPorUnidades(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PESSOA_POR_UNIDADES, Pessoa.class)
                        .setParameter(1, unidadeIds)
                        .getResultList());
    }


    public static final String SQL_BUSCAR_UNIDADES_POR_PESSOA =
            "SELECT DISTINCT p_u_jt.id_unidade FROM bas_pessoa_unidade p_u_jt WHERE p_u_jt.id_pessoa = ?1 ORDER BY p_u_jt.id_unidade";

    public Uni<java.util.List<Long>> buscarUnidadesPorPessoa(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADES_POR_PESSOA)
                        .setParameter(1, pessoaId)
                        .getResultList())
                .map(rows -> rows.stream()
                        .map(o -> o instanceof Number n ? n.longValue() : Long.valueOf(o.toString()))
                        .toList());
    }

}