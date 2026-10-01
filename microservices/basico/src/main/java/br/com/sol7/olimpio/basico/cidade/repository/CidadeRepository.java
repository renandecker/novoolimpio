package br.com.sol7.olimpio.basico.cidade.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.cidade.entity.Cidade;

@ApplicationScoped
public class CidadeRepository implements PanacheRepository<Cidade> {

    // select c from Cidade c where  lower(c.nome) like '%' || lower(?1) || '%'  OR  str(c.id) = ?1 or  lower(c.nome||c.estado.nome) like '%' || lower(?1) || '%' or  lower(c.nome||c.estado.uf) like '%' || ?1 || '%' or  lower(c.nome||' ('||c.estado.nome||')') like '%' || lower(?1) || '%' or  lower(c.nome||' ('||c.estado.uf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(c.nome||' '||c.estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or  replace(replace(lower(c.nome||' '||c.estado.uf),'(',''),')','') like '%' || lower(?1) || '%'  order by c.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT c.* FROM bas_cidade c LEFT JOIN bas_estado j_c_estado ON j_c_estado.id = c.id_estado WHERE lower(c.nome) like '%' || lower(?1) || '%' OR CAST(c.id AS text) = ?1 or lower(c.nome||j_c_estado.nome) like '%' || lower(?1) || '%' or lower(c.nome||j_c_estado.uf) like '%' || ?1 || '%' or lower(c.nome||' ('||j_c_estado.nome||')') like '%' || lower(?1) || '%' or lower(c.nome||' ('||j_c_estado.uf||')') like '%' || lower(?1) || '%' or replace(replace(lower(c.nome||' '||j_c_estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or replace(replace(lower(c.nome||' '||j_c_estado.uf),'(',''),')','') like '%' || lower(?1) || '%' ORDER BY c.nome LIMIT 10";

    public Uni<java.util.List<Cidade>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Cidade.class)
                        .setParameter(1, lowerCase)
                        .getResultList());
    }


    // select distinct c.bairro.cidade from Logradouro c where c.cep = ?2 and (lower(c.bairro.cidade.nome) like '%' || lower(?1) || '%'  OR  str(c.bairro.cidade.id) = ?1 or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.nome) like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.uf) like '%' || ?1 || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.nome||')') like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.uf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.uf),'(',''),')','') like '%' || lower(?1) || '%' ) order by c.bairro.cidade.nome
    public static final String SQL_AUTO_COMPLETE_COM_CEP =
            "SELECT DISTINCT j_c_bairro.id_cidade FROM bas_logradouro c LEFT JOIN bas_bairro j_c_bairro ON j_c_bairro.id = c.id_bairro LEFT JOIN bas_cidade j_j_c_bairro_cidade ON j_j_c_bairro_cidade.id = j_c_bairro.id_cidade LEFT JOIN bas_estado j_j_j_c_bairro_cidade_estado ON j_j_j_c_bairro_cidade_estado.id = j_j_c_bairro_cidade.id_estado WHERE c.cep = ?2 and (lower(j_j_c_bairro_cidade.nome) like '%' || lower(?1) || '%' OR CAST(j_j_c_bairro_cidade.id AS text) = ?1 or lower(j_j_c_bairro_cidade.nome||j_j_j_c_bairro_cidade_estado.nome) like '%' || lower(?1) || '%' or lower(j_j_c_bairro_cidade.nome||j_j_j_c_bairro_cidade_estado.uf) like '%' || ?1 || '%' or lower(j_j_c_bairro_cidade.nome||' ('||j_j_j_c_bairro_cidade_estado.nome||')') like '%' || lower(?1) || '%' or lower(j_j_c_bairro_cidade.nome||' ('||j_j_j_c_bairro_cidade_estado.uf||')') like '%' || lower(?1) || '%' or replace(replace(lower(j_j_c_bairro_cidade.nome||' '||j_j_j_c_bairro_cidade_estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or replace(replace(lower(j_j_c_bairro_cidade.nome||' '||j_j_j_c_bairro_cidade_estado.uf),'(',''),')','') like '%' || lower(?1) || '%' ) ORDER BY j_j_c_bairro_cidade.nome LIMIT 10";

    public Uni<java.util.List<Object>> autoCompleteComCep(String lowerCase, String cep) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CEP)
                        .setParameter(1, lowerCase)
                        .setParameter(2, cep)
                        .getResultList());
    }


    // select distinct c from Cidade c where  c.estado = ?2 and (lower(c.nome) like '%' || lower(?1) || '%'  OR  str(c.id) = ?1 or  lower(c.nome||c.estado.nome) like '%' || lower(?1) || '%' or  lower(c.nome||c.estado.uf) like '%' || ?1 || '%' or  lower(c.nome||' ('||c.estado.nome||')') like '%' || lower(?1) || '%' or  lower(c.nome||' ('||c.estado.uf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(c.nome||' '||c.estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or  replace(replace(lower(c.nome||' '||c.estado.uf),'(',''),')','') like '%' || lower(?1) || '%' ) order by c.nome
    public static final String SQL_AUTO_COMPLETE_COM_ESTADO =
            "SELECT DISTINCT c.* FROM bas_cidade c LEFT JOIN bas_estado j_c_estado ON j_c_estado.id = c.id_estado WHERE c.id_estado = ?2 and (lower(c.nome) like '%' || lower(?1) || '%' OR CAST(c.id AS text) = ?1 or lower(c.nome||j_c_estado.nome) like '%' || lower(?1) || '%' or lower(c.nome||j_c_estado.uf) like '%' || ?1 || '%' or lower(c.nome||' ('||j_c_estado.nome||')') like '%' || lower(?1) || '%' or lower(c.nome||' ('||j_c_estado.uf||')') like '%' || lower(?1) || '%' or replace(replace(lower(c.nome||' '||j_c_estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or replace(replace(lower(c.nome||' '||j_c_estado.uf),'(',''),')','') like '%' || lower(?1) || '%' ) ORDER BY c.nome LIMIT 10";

    public Uni<java.util.List<Cidade>> autoCompleteComEstado(String lowerCase, Long estadoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_ESTADO, Cidade.class)
                        .setParameter(1, lowerCase)
                        .setParameter(2, estadoId)
                        .getResultList());
    }


    // select distinct c.bairro.cidade from Logradouro c where c.cep = ?3 and (c.bairro.cidade.estado = ?2 and (lower(c.bairro.cidade.nome) like '%' || lower(?1) || '%'  OR  str(c.bairro.cidade.id) = ?1 or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.nome) like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.uf) like '%' || ?1 || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.nome||')') like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.uf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.uf),'(',''),')','') like '%' || lower(?1) || '%' )) order by c.bairro.cidade.nome
    public static final String SQL_AUTO_COMPLETE_COM_ESTADO_COM_CEP =
            "SELECT DISTINCT j_c_bairro.id_cidade FROM bas_logradouro c LEFT JOIN bas_bairro j_c_bairro ON j_c_bairro.id = c.id_bairro LEFT JOIN bas_cidade j_j_c_bairro_cidade ON j_j_c_bairro_cidade.id = j_c_bairro.id_cidade LEFT JOIN bas_estado j_j_j_c_bairro_cidade_estado ON j_j_j_c_bairro_cidade_estado.id = j_j_c_bairro_cidade.id_estado WHERE c.cep = ?3 and (j_j_c_bairro_cidade.id_estado = ?2 and (lower(j_j_c_bairro_cidade.nome) like '%' || lower(?1) || '%' OR CAST(j_j_c_bairro_cidade.id AS text) = ?1 or lower(j_j_c_bairro_cidade.nome||j_j_j_c_bairro_cidade_estado.nome) like '%' || lower(?1) || '%' or lower(j_j_c_bairro_cidade.nome||j_j_j_c_bairro_cidade_estado.uf) like '%' || ?1 || '%' or lower(j_j_c_bairro_cidade.nome||' ('||j_j_j_c_bairro_cidade_estado.nome||')') like '%' || lower(?1) || '%' or lower(j_j_c_bairro_cidade.nome||' ('||j_j_j_c_bairro_cidade_estado.uf||')') like '%' || lower(?1) || '%' or replace(replace(lower(j_j_c_bairro_cidade.nome||' '||j_j_j_c_bairro_cidade_estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or replace(replace(lower(j_j_c_bairro_cidade.nome||' '||j_j_j_c_bairro_cidade_estado.uf),'(',''),')','') like '%' || lower(?1) || '%' )) ORDER BY j_j_c_bairro_cidade.nome LIMIT 10";

    public Uni<java.util.List<Object>> autoCompleteComEstadoComCep(String lowerCase, Long estadoId, String cep) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_ESTADO_COM_CEP)
                        .setParameter(1, lowerCase)
                        .setParameter(2, estadoId)
                        .setParameter(3, cep)
                        .getResultList());
    }


    // select distinct c from Cidade c inner join c.estado e where (lower(e.uf) = ?2 or lower(e.nome)  = ?2) and lower(c.nome) = ?1
    public static final String SQL_BUSCA_CIDADE_COM_ESTADO_EUF =
            "SELECT DISTINCT c.* FROM bas_cidade c INNER JOIN bas_estado e ON e.id = c.id_estado WHERE (lower(e.uf) = ?2 or lower(e.nome) = ?2) and lower(c.nome) = ?1 LIMIT 10";

    public Uni<java.util.List<Cidade>> buscaCidadeComEstadoEuf(String cidade, String estado) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_CIDADE_COM_ESTADO_EUF, Cidade.class)
                        .setParameter(1, cidade)
                        .setParameter(2, estado)
                        .getResultList());
    }


    // select distinct c.nome from Cidade c where id=?1
    public static final String SQL_NOME_CIDADE =
            "SELECT DISTINCT c.nome FROM bas_cidade c WHERE id=?1";

    public Uni<java.util.List<Object>> nomeCidade(Integer idCidade) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_NOME_CIDADE)
                        .setParameter(1, idCidade)
                        .getResultList());
    }

}