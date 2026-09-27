package br.com.sol7.olimpio.bibliotecavirtual.livrodigital.repository;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class LivroDigitalRepository implements PanacheRepository<LivroDigital> {

    public Uni<List<LivroDigital>> findByTituloContainingIgnoreCase(String titulo) {
        return list("lower(titulo) like ?1", "%" + titulo.toLowerCase() + "%");
    }

    public Uni<List<LivroDigital>> findByIsbn(String isbn) {
        return list("isbn = ?1", isbn);
    }

    public Uni<List<LivroDigital>> findByCategoria(String categoria) {
        return list("categoria = ?1 and flAtivo = true", categoria);
    }

    public Uni<List<LivroDigital>> findAllAtivos() {
        return list("flAtivo = true order by titulo");
    }
}