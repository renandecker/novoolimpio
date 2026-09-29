package br.com.sol7.olimpio.biblioteca.emprestimo.service;

import br.com.sol7.olimpio.biblioteca.emprestimo.dto.EmprestimoRequest;
import br.com.sol7.olimpio.biblioteca.emprestimo.dto.EmprestimoResponse;
import br.com.sol7.olimpio.biblioteca.emprestimo.entity.Emprestimo;
import br.com.sol7.olimpio.biblioteca.emprestimo.repository.EmprestimoRepository;
import br.com.sol7.olimpio.biblioteca.exemplar.entity.Exemplar;
import br.com.sol7.olimpio.biblioteca.multa.entity.Multa;
import br.com.sol7.olimpio.biblioteca.multa.service.MultaService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class EmprestimoService {

    @Inject
    EmprestimoRepository repository;

    @Inject
    io.quarkus.hibernate.reactive.panache.PanacheRepository<Exemplar> exemplarRepository;

    @Inject
    MultaService multaService;

    public Uni<PagedResponse<EmprestimoResponse>> listar(SearchFilterRequest request, int page, int size, String sort, String direction) {
        boolean asc = "asc".equalsIgnoreCase(direction);
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(e -> e.flAtivo)
                        .sorted((a, b) -> {
                            EmprestimoResponse ra = EmprestimoResponse.fromEntity(a);
                            EmprestimoResponse rb = EmprestimoResponse.fromEntity(b);
                            int cmp;
                            switch (sort) {
                                case "id":
                                    cmp = Long.compare(ra.id, rb.id);
                                    break;
                                case "dataRetirada":
                                    cmp = ra.dataRetirada.compareTo(rb.dataRetirada);
                                    break;
                                case "dataPrevistaDevolucao":
                                    cmp = ra.dataPrevistaDevolucao.compareTo(rb.dataPrevistaDevolucao);
                                    break;
                                case "dataEfetivaDevolucao":
                                    cmp = ra.dataEfetivaDevolucao.compareTo(rb.dataEfetivaDevolucao);
                                    break;
                                case "quantidadeRenovacoes":
                                    cmp = Integer.compare(ra.quantidadeRenovacoes, rb.quantidadeRenovacoes);
                                    break;
                                case "status":
                                    cmp = ra.status.name().compareTo(rb.status.name());
                                    break;
                                case "observacoes":
                                    cmp = ra.observacoes == null ? rb.observacoes == null ? 0 : -1 : ra.observacoes.compareTo(rb.observacoes);
                                    break;
                                case "usuarioId":
                                    cmp = Long.compare(ra.usuarioId, rb.usuarioId);
                                    break;
                                case "dataCadastro":
                                    cmp = ra.dataCadastro.compareTo(rb.dataCadastro);
                                    break;
                                default:
                                    cmp = Long.compare(ra.id, rb.id);
                            }
                            return asc ? cmp : -cmp;
                        })
                        .map(EmprestimoResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<EmprestimoResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<EmprestimoResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo não encontrado: " + id))
                .onItem().transform(EmprestimoResponse::fromEntity);
    }

    @Transactional
    public Uni<EmprestimoResponse> criar(@Valid EmprestimoRequest request) {
        return exemplarRepository.findById(request.exemplarId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Exemplar não encontrado: " + request.exemplarId))
                .onItem().transformToUni(exemplar -> {
                    if (exemplar.status != Exemplar.StatusExemplar.DISPONIVEL) {
                        throw new IllegalStateException("Exemplar não está disponível para empréstimo");
                    }
                    Emprestimo emprestimo = request.toEntity();
                    emprestimo.exemplar = exemplar;
                    exemplar.status = Exemplar.StatusExemplar.EMPRESTADO;
                    return exemplarRepository.persist(exemplar)
                            .onItem().transformToUni(v -> repository.persist(emprestimo).replaceWith(emprestimo));
                })
                .onItem().transform(EmprestimoResponse::fromEntity);
    }

    @Transactional
    public Uni<EmprestimoResponse> devolver(Long id, LocalDateTime dataDevolucao) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo não encontrado: " + id))
                .onItem().transformToUni(emprestimo -> {
                    emprestimo.dataEfetivaDevolucao = dataDevolucao != null ? dataDevolucao : LocalDateTime.now();
                    emprestimo.exemplar.status = Exemplar.StatusExemplar.DISPONIVEL;

                    if (emprestimo.dataEfetivaDevolucao.toLocalDate().isAfter(emprestimo.dataPrevistaDevolucao)) {
                        emprestimo.status = Emprestimo.StatusEmprestimo.DEVOLVIDO_COM_ATRASO;
                        return exemplarRepository.persist(emprestimo.exemplar)
                                .onItem().transformToUni(v -> repository.persist(emprestimo).replaceWith(emprestimo))
                                .onItem().transformToUni(emp -> multaService.gerarMultaPorAtraso(emp).replaceWith(emp));
                    } else {
                        emprestimo.status = Emprestimo.StatusEmprestimo.DEVOLVIDO_NO_PRAZO;
                        return exemplarRepository.persist(emprestimo.exemplar)
                                .onItem().transformToUni(v -> repository.persist(emprestimo).replaceWith(emprestimo));
                    }
                })
                .onItem().transform(EmprestimoResponse::fromEntity);
    }

    @Transactional
    public Uni<EmprestimoResponse> renovar(Long id, LocalDate novaDataPrevista) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo não encontrado: " + id))
                .onItem().transformToUni(emprestimo -> {
                    if (emprestimo.status != Emprestimo.StatusEmprestimo.ATIVO) {
                        throw new IllegalStateException("Só é possível renovar empréstimos ativos");
                    }
                    emprestimo.dataPrevistaDevolucao = novaDataPrevista;
                    emprestimo.quantidadeRenovacoes++;
                    return repository.persist(emprestimo).replaceWith(emprestimo);
                })
                .onItem().transform(EmprestimoResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo não encontrado: " + id))
                .onItem().transformToUni(emprestimo -> {
                    emprestimo.flAtivo = false;
                    if (emprestimo.exemplar != null && emprestimo.exemplar.status == Exemplar.StatusExemplar.EMPRESTADO) {
                        emprestimo.exemplar.status = Exemplar.StatusExemplar.DISPONIVEL;
                        return exemplarRepository.persist(emprestimo.exemplar)
                                .onItem().transformToUni(v -> repository.persist(emprestimo).replaceWithVoid());
                    }
                    return repository.persist(emprestimo).replaceWithVoid();
                });
    }

    public Uni<List<EmprestimoResponse>> buscarPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(EmprestimoResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<EmprestimoResponse>> buscarAtivosPorUsuario(Long usuarioId) {
        return repository.findAtivosByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(EmprestimoResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<EmprestimoResponse>> buscarAtrasados() {
        return repository.findAtrasados(LocalDate.now())
                .onItem().transform(list -> list.stream()
                        .map(EmprestimoResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}