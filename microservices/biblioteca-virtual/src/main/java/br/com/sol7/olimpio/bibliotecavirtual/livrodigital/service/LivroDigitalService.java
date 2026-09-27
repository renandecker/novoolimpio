package br.com.sol7.olimpio.bibliotecavirtual.livrodigital.service;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto.LivroDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto.LivroDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.repository.LivroDigitalRepository;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.entity.LicencaAcervo;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.service.LicencaAcervoService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class LivroDigitalService {

    @Inject
    LivroDigitalRepository repository;

    @Inject
    LicencaAcervoService licencaService;

    public Uni<PagedResponse<LivroDigitalResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(l -> l.flAtivo)
                        .map(this::toResponseComLicenca)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<LivroDigitalResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<LivroDigitalResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Livro Digital não encontrado: " + id))
                .onItem().transform(this::toResponseComLicenca);
    }

    @Transactional
    public Uni<LivroDigitalResponse> criar(@Valid LivroDigitalRequest request) {
        LivroDigital livro = request.toEntity();
        return repository.persist(livro)
                .onItem().transformToUni(l -> {
                    if (request.formatosDisponiveis != null && !request.formatosDisponiveis.isEmpty()) {
                        return licencaService.criarLicencaPadrao(l.id)
                                .onItem().transform(licenca -> toResponseComLicenca(l));
                    }
                    return Uni.createFrom().item(toResponseComLicenca(l));
                });
    }

    @Transactional
    public Uni<LivroDigitalResponse> atualizar(Long id, @Valid LivroDigitalRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Livro Digital não encontrado: " + id))
                .onItem().transformToUni(livro -> {
                    request.updateEntity(livro);
                    return repository.persist(livro).replaceWith(livro);
                })
                .onItem().transform(this::toResponseComLicenca);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Livro Digital não encontrado: " + id))
                .onItem().transformToUni(livro -> {
                    livro.flAtivo = false;
                    return repository.persist(livro).replaceWithVoid();
                });
    }

    public Uni<List<LivroDigitalResponse>> buscarPorTitulo(String titulo) {
        return repository.findByTituloContainingIgnoreCase(titulo)
                .onItem().transform(list -> list.stream()
                        .map(this::toResponseComLicenca)
                        .collect(Collectors.toList()));
    }

    private LivroDigitalResponse toResponseComLicenca(LivroDigital livro) {
        LivroDigitalResponse resp = LivroDigitalResponse.fromEntity(livro);
        // Licença will be loaded lazily if needed
        return resp;
    }
}