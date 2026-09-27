package br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.service;

import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.dto.EmprestimoDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.dto.EmprestimoDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.entity.EmprestimoDigital;
import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.repository.EmprestimoDigitalRepository;
import br.com.sol7.olimpio.bibliotecavirtual.filaespera.entity.FilaEsperaDigital;
import br.com.sol7.olimpio.bibliotecavirtual.filaespera.service.FilaEsperaDigitalService;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.service.LicencaAcervoService;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
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
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class EmprestimoDigitalService {

    @Inject
    EmprestimoDigitalRepository repository;

    @Inject
    io.quarkus.hibernate.reactive.panache.PanacheRepository<LivroDigital> livroRepository;

    @Inject
    LicencaAcervoService licencaService;

    @Inject
    FilaEsperaDigitalService filaService;

    public Uni<PagedResponse<EmprestimoDigitalResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(e -> e.flAtivo)
                        .map(EmprestimoDigitalResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<EmprestimoDigitalResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<EmprestimoDigitalResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo Digital não encontrado: " + id))
                .onItem().transform(EmprestimoDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<EmprestimoDigitalResponse> criar(@Valid EmprestimoDigitalRequest request) {
        return livroRepository.findById(request.livroDigitalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Livro Digital não encontrado: " + request.livroDigitalId))
                .onItem().transformToUni(livro -> {
                    return licencaService.ocuparLicenca(livro.id)
                            .onItem().transformToUni(licenca -> {
                                EmprestimoDigital emprestimo = request.toEntity();
                                emprestimo.livroDigital = livro;
                                emprestimo.tokenDrm = gerarTokenDrm();
                                return repository.persist(emprestimo).replaceWith(emprestimo);
                            });
                })
                .onItem().transform(EmprestimoDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<EmprestimoDigitalResponse> devolverAntecipadamente(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo Digital não encontrado: " + id))
                .onItem().transformToUni(emprestimo -> {
                    if (emprestimo.status != EmprestimoDigital.StatusEmprestimoDigital.ATIVO) {
                        throw new IllegalStateException("Só é possível devolver empréstimos ativos");
                    }
                    emprestimo.status = EmprestimoDigital.StatusEmprestimoDigital.DEVOLVIDO_ANTECIPADAMENTE;
                    emprestimo.dataDevolucaoAntecipada = LocalDateTime.now();
                    return licencaService.liberarLicenca(emprestimo.livroDigital.id)
                            .onItem().transformToUni(v -> repository.persist(emprestimo).replaceWith(emprestimo))
                            .onItem().transformToUni(emp -> filaService.notificarProximoDaFila(emp.livroDigital.id).replaceWith(emp));
                })
                .onItem().transform(EmprestimoDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<EmprestimoDigitalResponse> renovar(Long id, LocalDateTime novaDataExpiracao) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo Digital não encontrado: " + id))
                .onItem().transformToUni(emprestimo -> {
                    if (emprestimo.status != EmprestimoDigital.StatusEmprestimoDigital.ATIVO) {
                        throw new IllegalStateException("Só é possível renovar empréstimos ativos");
                    }
                    // Verifica se há fila de espera
                    return filaService.verificarFilaVazia(emprestimo.livroDigital.id)
                            .onItem().transformToUni(filaVazia -> {
                                if (!filaVazia) {
                                    throw new IllegalStateException("Não é possível renovar: há usuários na fila de espera");
                                }
                                emprestimo.dataExpiracao = novaDataExpiracao;
                                emprestimo.tokenDrm = gerarTokenDrm();
                                return repository.persist(emprestimo).replaceWith(emprestimo);
                            });
                })
                .onItem().transform(EmprestimoDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> processarExpiracao() {
        return repository.findExpirados(LocalDateTime.now())
                .onItem().transformToMulti(list -> io.smallrye.mutiny.Multi.createFrom().iterable(list))
                .onItem().transformToUniAndMerge(emprestimo -> {
                    emprestimo.status = EmprestimoDigital.StatusEmprestimoDigital.EXPIRADO;
                    return licencaService.liberarLicenca(emprestimo.livroDigital.id)
                            .onItem().transformToUni(v -> repository.persist(emprestimo).replaceWithVoid())
                            .onItem().transformToUni(v -> filaService.notificarProximoDaFila(emprestimo.livroDigital.id).replaceWithVoid());
                })
                .collect().asList()
                .replaceWithVoid();
    }

    @Transactional
    public Uni<EmprestimoDigitalResponse> atualizarProgresso(Long id, Integer progresso, Integer ultimaPagina) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo Digital não encontrado: " + id))
                .onItem().transformToUni(emprestimo -> {
                    emprestimo.progressoLeitura = progresso;
                    emprestimo.ultimaPaginaLida = ultimaPagina;
                    return repository.persist(emprestimo).replaceWith(emprestimo);
                })
                .onItem().transform(EmprestimoDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empréstimo Digital não encontrado: " + id))
                .onItem().transformToUni(emprestimo -> {
                    emprestimo.flAtivo = false;
                    if (emprestimo.status == EmprestimoDigital.StatusEmprestimoDigital.ATIVO) {
                        return licencaService.liberarLicenca(emprestimo.livroDigital.id)
                                .onItem().transformToUni(v -> repository.persist(emprestimo).replaceWithVoid());
                    }
                    return repository.persist(emprestimo).replaceWithVoid();
                });
    }

    public Uni<List<EmprestimoDigitalResponse>> buscarPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(EmprestimoDigitalResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<EmprestimoDigitalResponse>> buscarAtivosPorUsuario(Long usuarioId) {
        return repository.findAtivosByUsuarioId(usuarioId)
                .onItem().transform(list -> list.stream()
                        .map(EmprestimoDigitalResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    private String gerarTokenDrm() {
        return UUID.randomUUID().toString();
    }
}