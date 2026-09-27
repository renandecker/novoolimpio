package br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.service;

import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.dto.LicencaAcervoRequest;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.dto.LicencaAcervoResponse;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.entity.LicencaAcervo;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.repository.LicencaAcervoRepository;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
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
public class LicencaAcervoService {

    @Inject
    LicencaAcervoRepository repository;

    @Inject
    io.quarkus.hibernate.reactive.panache.PanacheRepository<LivroDigital> livroRepository;

    public Uni<PagedResponse<LicencaAcervoResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(l -> l.flAtivo)
                        .map(LicencaAcervoResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<LicencaAcervoResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<LicencaAcervoResponse> buscarPorLivroDigitalId(Long livroDigitalId) {
        return repository.findByLivroDigitalId(livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Licença não encontrada para o livro: " + livroDigitalId))
                .onItem().transform(LicencaAcervoResponse::fromEntity);
    }

    @Transactional
    public Uni<LicencaAcervoResponse> criar(@Valid LicencaAcervoRequest request) {
        return livroRepository.findById(request.livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Livro Digital não encontrado: " + request.livroDigitalId))
                .onItem().transformToUni(livro -> {
                    LicencaAcervo licenca = request.toEntity();
                    licenca.livroDigital = livro;
                    return repository.persist(licenca).replaceWith(licenca);
                })
                .onItem().transform(LicencaAcervoResponse::fromEntity);
    }

    @Transactional
    public Uni<LicencaAcervoResponse> criarLicencaPadrao(Long livroDigitalId) {
        return livroRepository.findById(livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Livro Digital não encontrado: " + livroDigitalId))
                .onItem().transformToUni(livro -> {
                    LicencaAcervo licenca = new LicencaAcervo();
                    licenca.livroDigital = livro;
                    licenca.modeloLicenca = LicencaAcervo.ModeloLicenca.COPIA_UNICA;
                    licenca.totalLicencasContratadas = 1;
                    licenca.dataCadastro = java.time.LocalDate.now();
                    licenca.flAtivo = true;
                    return repository.persist(licenca).replaceWith(licenca);
                })
                .onItem().transform(LicencaAcervoResponse::fromEntity);
    }

    @Transactional
    public Uni<LicencaAcervoResponse> atualizar(Long livroDigitalId, @Valid LicencaAcervoRequest request) {
        return repository.findByLivroDigitalId(livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Licença não encontrada para o livro: " + livroDigitalId))
                .onItem().transformToUni(licenca -> {
                    request.updateEntity(licenca);
                    return repository.persist(licenca).replaceWith(licenca);
                })
                .onItem().transform(LicencaAcervoResponse::fromEntity);
    }

    @Transactional
    public Uni<LicencaAcervoResponse> ocuparLicenca(Long livroDigitalId) {
        return repository.findByLivroDigitalIdForUpdate(livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Licença não encontrada para o livro: " + livroDigitalId))
                .onItem().transformToUni(licenca -> {
                    if (!licenca.hasLicencasDisponiveis()) {
                        throw new IllegalStateException("Não há licenças disponíveis");
                    }
                    licenca.licencasEmUso++;
                    if (licenca.modeloLicenca == LicencaAcervo.ModeloLicenca.METERED_ACCESS) {
                        licenca.acessosRealizados++;
                    }
                    return repository.persist(licenca).replaceWith(licenca);
                })
                .onItem().transform(LicencaAcervoResponse::fromEntity);
    }

    @Transactional
    public Uni<LicencaAcervoResponse> liberarLicenca(Long livroDigitalId) {
        return repository.findByLivroDigitalIdForUpdate(livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Licença não encontrada para o livro: " + livroDigitalId))
                .onItem().transformToUni(licenca -> {
                    if (licenca.licencasEmUso > 0) {
                        licenca.licencasEmUso--;
                    }
                    return repository.persist(licenca).replaceWith(licenca);
                })
                .onItem().transform(LicencaAcervoResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long livroDigitalId) {
        return repository.findByLivroDigitalId(livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Licença não encontrada para o livro: " + livroDigitalId))
                .onItem().transformToUni(licenca -> {
                    licenca.flAtivo = false;
                    return repository.persist(licenca).replaceWithVoid();
                });
    }
}