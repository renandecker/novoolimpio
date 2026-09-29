package br.com.sol7.olimpio.bibliotecavirtual.filaespera.service;

import br.com.sol7.olimpio.bibliotecavirtual.filaespera.dto.FilaEsperaDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.filaespera.dto.FilaEsperaDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.filaespera.entity.FilaEsperaDigital;
import br.com.sol7.olimpio.bibliotecavirtual.filaespera.repository.FilaEsperaDigitalRepository;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class FilaEsperaDigitalService {

    @Inject
    FilaEsperaDigitalRepository repository;

    @Inject
    io.quarkus.hibernate.reactive.panache.PanacheRepository<LivroDigital> livroRepository;

    public Uni<PagedResponse<FilaEsperaDigitalResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(f -> f.flAtivo)
                        .map(FilaEsperaDigitalResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<FilaEsperaDigitalResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<FilaEsperaDigitalResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Fila de Espera não encontrada: " + id))
                .onItem().transform(FilaEsperaDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<FilaEsperaDigitalResponse> entrarNaFila(@Valid FilaEsperaDigitalRequest request) {
        return livroRepository.findById(request.livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Livro Digital não encontrado: " + request.livroDigitalId))
                .onItem().transformToUni(livro -> {
                    FilaEsperaDigital fila = request.toEntity();
                    fila.livroDigital = livro;
                    return repository.countAguardandoByLivroDigitalId(livro.id)
                            .onItem().transformToUni(count -> {
                                fila.posicaoFila = count.intValue() + 1;
                                return repository.persist(fila).replaceWith(fila);
                            });
                })
                .onItem().transform(FilaEsperaDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<FilaEsperaDigitalResponse> notificarProximoDaFila(Long livroDigitalId) {
        return repository.findPrimeiroNaFila(livroDigitalId)
                .onItem().ifNull().continueWith(() -> null)
                .onItem().transformToUni(fila -> {
                    if (fila == null) {
                        return Uni.createFrom().nullItem();
                    }
                    fila.status = FilaEsperaDigital.StatusFila.NOTIFICADO;
                    fila.dataNotificacao = LocalDateTime.now();
                    fila.dataLimiteResgate = LocalDateTime.now().plusHours(24);
                    return repository.persist(fila).replaceWith(fila);
                })
                .onItem().transform(f -> f != null ? FilaEsperaDigitalResponse.fromEntity(f) : null);
    }

    @Transactional
    public Uni<FilaEsperaDigitalResponse> resgatar(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Fila de Espera não encontrada: " + id))
                .onItem().transformToUni(fila -> {
                    if (fila.status != FilaEsperaDigital.StatusFila.NOTIFICADO) {
                        throw new IllegalStateException("Só é possível resgatar após notificação");
                    }
                    if (fila.dataLimiteResgate != null && LocalDateTime.now().isAfter(fila.dataLimiteResgate)) {
                        fila.status = FilaEsperaDigital.StatusFila.EXPIRADO;
                        return repository.persist(fila).replaceWith(fila)
                                .onItem().transformToUni(f -> atualizarPosicoesFila(f.livroDigital.id).replaceWith(f));
                    }
                    fila.status = FilaEsperaDigital.StatusFila.RESGATADO;
                    fila.dataResgate = LocalDateTime.now();
                    return repository.persist(fila).replaceWith(fila)
                            .onItem().transformToUni(f -> atualizarPosicoesFila(f.livroDigital.id).replaceWith(f));
                })
                .onItem().transform(f -> f != null ? FilaEsperaDigitalResponse.fromEntity(f) : null);
    }

    @Transactional
    public Uni<FilaEsperaDigitalResponse> cancelar(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Fila de Espera não encontrada: " + id))
                .onItem().transformToUni(fila -> {
                    fila.status = FilaEsperaDigital.StatusFila.CANCELADO;
                    return repository.persist(fila).replaceWith(fila)
                            .onItem().transformToUni(f -> atualizarPosicoesFila(f.livroDigital.id).replaceWith(f));
                })
                .onItem().transform(FilaEsperaDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> atualizarPosicoesFila(Long livroDigitalId) {
        return repository.findAguardandoByLivroDigitalId(livroDigitalId)
                .onItem().transformToUni(list -> {
                    if (list == null || list.isEmpty()) {
                        return Uni.createFrom().voidItem();
                    }
                    int[] index = {0};
                    return io.smallrye.mutiny.Multi.createFrom().iterable(list)
                            .onItem().transformToUniAndMerge(fila -> {
                                int currentIndex = index[0]++;
                                int novaPosicao = currentIndex + 1;
                                if (fila.posicaoFila != novaPosicao) {
                                    fila.posicaoFila = novaPosicao;
                                    return repository.persist(fila).replaceWithVoid();
                                }
                                return Uni.createFrom().voidItem();
                            })
                            .collect().asList()
                            .replaceWithVoid();
                });
    }

    public Uni<Boolean> verificarFilaVazia(Long livroDigitalId) {
        return repository.countAguardandoByLivroDigitalId(livroDigitalId)
                .onItem().transform(count -> count == 0);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Fila de Espera não encontrada: " + id))
                .onItem().transformToUni(fila -> {
                    fila.flAtivo = false;
                    return repository.persist(fila).replaceWithVoid();
                });
    }

    public Uni<List<FilaEsperaDigitalResponse>> buscarPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(FilaEsperaDigitalResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<FilaEsperaDigitalResponse>> buscarPorLivroDigital(Long livroDigitalId) {
        return repository.findByLivroDigitalId(livroDigitalId)
                .onItem().transform(list -> list.stream()
                        .map(FilaEsperaDigitalResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}