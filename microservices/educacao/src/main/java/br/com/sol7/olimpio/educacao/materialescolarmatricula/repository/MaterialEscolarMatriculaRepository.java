package br.com.sol7.olimpio.educacao.materialescolarmatricula;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class MaterialEscolarMatriculaRepository implements PanacheRepository<MaterialEscolarMatricula> {

    public Uni<List<MaterialEscolarMatricula>> listByMatricula(Long matriculaId) {
        return find("matriculaId = ?1 order by id", matriculaId).list();
    }
}
