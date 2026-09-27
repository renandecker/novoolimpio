package br.com.sol7.olimpio.biblioteca.reserva.service;

import br.com.sol7.olimpio.biblioteca.reserva.dto.ReservaRequest;
import br.com.sol7.olimpio.biblioteca.reserva.dto.ReservaResponse;
import br.com.sol7.olimpio.biblioteca.reserva.entity.Reserva;
import br.com.sol7.olimpio.biblioteca.reserva.repository.ReservaRepository;
import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
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
public class ReservaService {

    @Inject
    ReservaRepository repository;

    @Inject
    io.quarkus.hibernate.reactive.panache.PanacheRepository<Obra> obraRepository;

    public Uni<PagedResponse<ReservaResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(r -> r.flAtivo)
                        .map(ReservaResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<ReservaResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<ReservaResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Reserva não encontrada: " + id))
                .onItem().transform(ReservaResponse::fromEntity);
    }

    @Transactional
    public Uni<ReservaResponse> criar(@Valid ReservaRequest request) {
        return obraRepository.findById(request.obraId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Obra não encontrada: " + request.obraId))
                .onItem().transformToUni(obra -> {
                    Reserva reserva = request.toEntity();
                    reserva.obra = obra;
                    reserva.dataSolicitacao = LocalDateTime.now();
                    return repository.countAguardandoByObraId(obra.id)
                            .onItem().transformToUni(count -> {
                                reserva.posicaoFila = count.intValue() + 1;
                                return repository.persist(reserva).replaceWith(reserva);
                            });
                })
                .onItem().transform(ReservaResponse::fromEntity);
    }

    @Transactional
    public Uni<ReservaResponse> atualizar(Long id, @Valid ReservaRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Reserva não encontrada: " + id))
                .onItem().transformToUni(reserva -> {
                    request.updateEntity(reserva);
                    return repository.persist(reserva).replaceWith(reserva);
                })
                .onItem().transform(ReservaResponse::fromEntity);
    }

    @Transactional
    public Uni<ReservaResponse> disponibilizarParaRetirada(Long id, LocalDateTime dataLimiteRetirada) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Reserva não encontrada: " + id))
                .onItem().transformToUni(reserva -> {
                    reserva.status = Reserva.StatusReserva.DISPONIVEL_PARA_RETIRADA;
                    reserva.dataDisponibilizacao = LocalDateTime.now();
                    reserva.dataLimiteRetirada = dataLimiteRetirada;
                    return repository.persist(reserva).replaceWith(reserva);
                })
                .onItem().transform(ReservaResponse::fromEntity);
    }

    @Transactional
    public Uni<ReservaResponse> concluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Reserva não encontrada: " + id))
                .onItem().transformToUni(reserva -> {
                    reserva.status = Reserva.StatusReserva.CONCLUIDA;
                    return repository.persist(reserva).replaceWith(reserva);
                })
                .onItem().transform(ReservaResponse::fromEntity);
    }

    @Transactional
    public Uni<ReservaResponse> cancelar(Long id, String motivo) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Reserva não encontrada: " + id))
                .onItem().transformToUni(reserva -> {
                    reserva.status = Reserva.StatusReserva.CANCELADA;
                    reserva.dataCancelamento = LocalDateTime.now();
                    reserva.motivoCancelamento = motivo;
                    return repository.persist(reserva).replaceWith(reserva);
                })
                .onItem().transform(ReservaResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Reserva não encontrada: " + id))
                .onItem().transformToUni(reserva -> {
                    reserva.flAtivo = false;
                    return repository.persist(reserva).replaceWithVoid();
                });
    }

    public Uni<List<ReservaResponse>> buscarPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(ReservaResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<ReservaResponse>> buscarPorObra(Long obraId) {
        return repository.findByObraId(obraId)
                .onItem().transform(list -> list.stream()
                        .map(ReservaResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}