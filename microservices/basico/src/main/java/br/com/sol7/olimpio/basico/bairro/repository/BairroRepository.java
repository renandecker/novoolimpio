package br.com.sol7.olimpio.basico.bairro.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.bairro.entity.Bairro;

@ApplicationScoped
public class BairroRepository implements PanacheRepository<Bairro> {

    // select distinct c from Bairro c where lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1  order by c.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT c.* FROM bas_bairro c WHERE lower(c.descricao) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<Bairro>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Bairro.class)
                        .setParameter(1, lowerCase)
                        .getResultList());
    }


    // select distinct c.bairro from Logradouro c where c.cep = ?2 and lower(c.bairro.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1  order by c.descricao
    public static final String SQL_AUTO_COMPLETE_COM_CEP =
            "SELECT DISTINCT c.id_bairro FROM bas_logradouro c LEFT JOIN bas_bairro j_c_bairro ON j_c_bairro.id = c.id_bairro WHERE c.cep = ?2 and lower(j_c_bairro.descricao) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<Object>> autoCompleteComCep(String lowerCase, String cep) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CEP)
                        .setParameter(1, lowerCase)
                        .setParameter(2, cep)
                        .getResultList());
    }


    // select distinct c from Bairro c where c.cidade = ?2 and (lower(c.descricao) like '%' || ?1 || '%')  order by c.descricao
    public static final String SQL_AUTO_COMPLETE_COM_CIDADE =
            "SELECT DISTINCT c.* FROM bas_bairro c WHERE c.id_cidade = ?2 and (lower(c.descricao) like '%' || ?1 || '%') ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<Bairro>> autoCompleteComCidade(String lowerCase, Long cidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CIDADE, Bairro.class)
                        .setParameter(1, lowerCase)
                        .setParameter(2, cidadeId)
                        .getResultList());
    }


    // select distinct c.bairro from Logradouro c where c.bairro.cidade = ?2 and c.cep = ?3 and (lower(c.bairro.descricao) like '%' || ?1 || '%')  order by c.bairro.descricao
    public static final String SQL_AUTO_COMPLETE_COM_CIDADE_COM_CEP =
            "SELECT DISTINCT c.id_bairro FROM bas_logradouro c LEFT JOIN bas_bairro j_c_bairro ON j_c_bairro.id = c.id_bairro WHERE j_c_bairro.id_cidade = ?2 and c.cep = ?3 and (lower(j_c_bairro.descricao) like '%' || ?1 || '%') ORDER BY j_c_bairro.descricao LIMIT 10";

    public Uni<java.util.List<Object>> autoCompleteComCidadeComCep(String lowerCase, Long cidadeId, String cep) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CIDADE_COM_CEP)
                        .setParameter(1, lowerCase)
                        .setParameter(2, cidadeId)
                        .setParameter(3, cep)
                        .getResultList());
    }


    // select distinct c from Bairro c where c.cidade = ?2 and c.cidade.estado = ?3 and (lower(c.descricao) like '%' || ?1 || '%')  order by c.descricao
    public static final String SQL_AUTO_COMPLETE_COM_CIDADE_ESTADO =
            "SELECT DISTINCT c.* FROM bas_bairro c LEFT JOIN bas_cidade j_c_cidade ON j_c_cidade.id = c.id_cidade WHERE c.id_cidade = ?2 and j_c_cidade.id_estado = ?3 and (lower(c.descricao) like '%' || ?1 || '%') ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<Bairro>> autoCompleteComCidadeEstado(String lowerCase, Long cidadeId, Long estadoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CIDADE_ESTADO, Bairro.class)
                        .setParameter(1, lowerCase)
                        .setParameter(2, cidadeId)
                        .setParameter(3, estadoId)
                        .getResultList());
    }


    // select distinct c.bairro from Logradouro c where c.cep = ?4 and c.bairro.cidade = ?2 and c.bairro.cidade.estado = ?3 and (lower(c.bairro.descricao) like '%' || ?1 || '%')  order by c.bairro.descricao
    public static final String SQL_AUTO_COMPLETE_COM_CIDADE_ESTADO_COM_CEP =
            "SELECT DISTINCT c.id_bairro FROM bas_logradouro c LEFT JOIN bas_bairro j_c_bairro ON j_c_bairro.id = c.id_bairro LEFT JOIN bas_cidade j_j_c_bairro_cidade ON j_j_c_bairro_cidade.id = j_c_bairro.id_cidade WHERE c.cep = ?4 and j_c_bairro.id_cidade = ?2 and j_j_c_bairro_cidade.id_estado = ?3 and (lower(j_c_bairro.descricao) like '%' || ?1 || '%') ORDER BY j_c_bairro.descricao LIMIT 10";

    public Uni<java.util.List<Object>> autoCompleteComCidadeEstadoComCep(String lowerCase, Long cidadeId, Long estadoId, String cep) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CIDADE_ESTADO_COM_CEP)
                        .setParameter(1, lowerCase)
                        .setParameter(2, cidadeId)
                        .setParameter(3, estadoId)
                        .setParameter(4, cep)
                        .getResultList());
    }


    // select distinct c from Bairro c where c.cidade = ?1
    public static final String SQL_BUSCA_BAIRRO =
            "SELECT DISTINCT c.* FROM bas_bairro c WHERE c.id_cidade = ?1";

    public Uni<java.util.List<Bairro>> buscaBairro(Long cidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_BAIRRO, Bairro.class)
                        .setParameter(1, cidadeId)
                        .getResultList());
    }

}