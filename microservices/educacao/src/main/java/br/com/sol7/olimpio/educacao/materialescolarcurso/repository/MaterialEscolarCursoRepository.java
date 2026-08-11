package br.com.sol7.olimpio.educacao.materialescolarcurso;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class MaterialEscolarCursoRepository implements PanacheRepository<MaterialEscolarCurso> {

    public Uni<List<MaterialEscolarCurso>> listByCurriculo(Long curriculoId) {
        return find("curriculoId = ?1 order by id", curriculoId).list();
    }

    public Uni<List<MaterialEscolarCurso>> listByProduto(Long produtoId) {
        return find("produtoId = ?1", produtoId).list();
    }
}
