package br.com.sol7.olimpio.educacao.grupocomponentecurricular;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class GrupoComponenteCurricularRepository implements PanacheRepository<GrupoComponenteCurricular> {

    // Migrado de GrupoComponenteCurricularRepository.buscarTodos (legado) - HQL original:
    // select op from GrupoComponenteCurricular op order by op.descricao
    public static final String SQL_BUSCAR_TODOS =
            "SELECT op.* FROM edc_grupo_componente_curricular op ORDER BY op.descricao";

    public Uni<java.util.List<GrupoComponenteCurricular>> buscarTodos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TODOS, GrupoComponenteCurricular.class)

                        .getResultList());
    }

}