package br.com.sol7.olimpio.biblioteca.multa.service;

import br.com.sol7.olimpio.biblioteca.multa.dto.MultaRequest;
import br.com.sol7.olimpio.biblioteca.multa.dto.MultaResponse;
import br.com.sol7.olimpio.biblioteca.multa.entity.Multa;
import br.com.sol7.olimpio.biblioteca.multa.repository.MultaRepository;
import br.com.sol7.olimpio.biblioteca.emprestimo.entity.Emprestimo;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class MultaService {

    @Inject
    MultaRepository repository;

    @Inject
    io.quarkus.hibernate.reactive.panache.PanacheRepository<Emprestimo> emprestimoRepository;

    private static final BigDecimal VALOR_POR_DIA_PADRAO = new BigDecimal("1.00");

    public Uni<PagedResponse<MultaResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(m -> m.flAtivo)
                        .map(MultaResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<MultaResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<MultaResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Multa não encontrada: " + id))
                .onItem().transform(MultaResponse::fromEntity);
    }

    @Transactional
    public Uni<MultaResponse> criar(@Valid MultaRequest request) {
        return emprestimoRepository.findById(request.emprestimoId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo não encontrado: " + request.emprestimoId))
                .onItem().transformToUni(emprestimo -> {
                    Multa multa = request.toEntity();
                    multa.emprestimo = emprestimo;
                    return repository.persist(multa).replaceWith(multa);
                })
                .onItem().transform(MultaResponse::fromEntity);
    }

    @Transactional
    public Uni<MultaResponse> gerarMultaPorAtraso(Emprestimo emprestimo) {
        if (emprestimo.dataEfetivaDevolucao == null || emprestimo.dataPrevistaDevolucao == null) {
            return Uni.createFrom().nullItem();
        }

        long diasAtraso = ChronoUnit.DAYS.between(emprestimo.dataPrevistaDevolucao, emprestimo.dataEfetivaDevolucao.toLocalDate());
        if (diasAtraso <= 0) {
            return Uni.createFrom().nullItem();
        }

        BigDecimal valorTotal = VALOR_POR_DIA_PADRAO.multiply(BigDecimal.valueOf(diasAtraso));

        Multa multa = new Multa();
        multa.emprestimo = emprestimo;
        multa.usuarioId = emprestimo.usuarioId;
        multa.diasAtraso = (int) diasAtraso;
        multa.valorPorDia = VALOR_POR_DIA_PADRAO;
        multa.valorTotal = valorTotal;
        multa.motivo = Multa.MotivoMulta.ATRASO_DEVOLUCAO;
        multa.statusPagamento = Multa.StatusPagamento.PENDENTE;
        multa.dataCadastro = LocalDate.now();
        multa.flAtivo = true;

        return repository.persist(multa)
                .onItem().transform(MultaResponse::fromEntity);
    }

    @Transactional
    public Uni<MultaResponse> pagar(Long id, Multa.FormaPagamento formaPagamento) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Multa não encontrada: " + id))
                .onItem().transformToUni(multa -> {
                    multa.statusPagamento = Multa.StatusPagamento.PAGO;
                    multa.dataPagamento = LocalDateTime.now();
                    multa.formaPagamento = formaPagamento;
                    return repository.persist(multa).replaceWith(multa);
                })
                .onItem().transform(MultaResponse::fromEntity);
    }

    @Transactional
    public Uni<MultaResponse> isentar(Long id, String observacoes) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Multa não encontrada: " + id))
                .onItem().transformToUni(multa -> {
                    multa.statusPagamento = Multa.StatusPagamento.ISENTO_ANULADO;
                    multa.observacoes = observacoes;
                    return repository.persist(multa).replaceWith(multa);
                })
                .onItem().transform(MultaResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Multa não encontrada: " + id))
                .onItem().transformToUni(multa -> {
                    multa.flAtivo = false;
                    return repository.persist(multa).replaceWithVoid();
                });
    }

    public Uni<List<MultaResponse>> buscarPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(MultaResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<MultaResponse>> buscarPendentesPorUsuario(Long usuarioId) {
        return repository.findPendentesByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(MultaResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}