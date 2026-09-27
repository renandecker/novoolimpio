package br.com.sol7.olimpio.biblioteca.obra.repository;

import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ObraRepository implements PanacheRepository<Obra> {

    public Uni<List<Obra>> findByTituloContainingIgnoreCase(String titulo) {
        return list("lower(titulo) like ?1", "%" + titulo.toLowerCase() + "%");
    }

    public Uni<List<Obra>> findByIsbn(String isbn) {
        return list("isbn = ?1", isbn);
    }

    public Uni<List<Obra>> findByAutorContainingIgnoreCase(String autor) {
        return list("lower(autores) like ?1", "%" + autor.toLowerCase() + "%");
    }

    public Uni<List<Obra>> findByCategoria(String categoria) {
        return list("categoria = ?1 and flAtivo = true", categoria);
    }

    public Uni<List<Obra>> findAllAtivas() {
        return list("flAtivo = true order by titulo");
    }
}