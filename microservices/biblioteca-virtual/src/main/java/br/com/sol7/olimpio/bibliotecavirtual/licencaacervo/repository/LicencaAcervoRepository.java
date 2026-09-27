package br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.repository;

import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.entity.LicencaAcervo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class LicencaAcervoRepository implements PanacheRepository<LicencaAcervo> {

    public Uni<LicencaAcervo> findByLivroDigitalId(Long livroDigitalId) {
        return find("livroDigital.id = ?1 and flAtivo = true", livroDigitalId).firstResult();
    }

    public Uni<LicencaAcervo> findByLivroDigitalIdForUpdate(Long livroDigitalId) {
        return find("livroDigital.id = ?1 and flAtivo = true", livroDigitalId).firstResult();
    }
}