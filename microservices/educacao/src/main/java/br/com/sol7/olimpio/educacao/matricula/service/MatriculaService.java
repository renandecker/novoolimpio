package br.com.sol7.olimpio.educacao.matricula;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.contrato.ContratoRepository;
import br.com.sol7.olimpio.educacao.basico.PessoaFisica;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;

import java.time.LocalDate;
import java.util.Date;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class MatriculaService {

    @Inject
    MatriculaRepository repository;

    @Inject
    ContratoRepository contratoRepository;

    public Uni<List<MatriculaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MatriculaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MatriculaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Matricula not found"))
                .map(this::toResponse);
    }

    public Uni<MatriculaResponse> create(MatriculaRequest r) {
        var e = new Matricula();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MatriculaResponse> update(Long id, MatriculaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Matricula not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Matricula not found")));
    }

    private void apply(Matricula e, MatriculaRequest r) {
        e.oferecimentoComponenteCurricularId = r.oferecimentoComponenteCurricularId();
        e.contratoId = r.contratoId();
        e.cadernoComponenteCurricularId = r.cadernoComponenteCurricularId();
        e.formaPagamentoId = r.formaPagamentoId();
        e.dataCancelamento = r.dataCancelamento();
        e.motivoCancelamento = r.motivoCancelamento();
        e.status = r.status();
        e.mediaFinal = r.mediaFinal();
        e.percentualPresenca = r.percentualPresenca();
        e.qtdeChamadaFrequencia = r.qtdeChamadaFrequencia();
        e.data = r.data();
        e.totalAulas = r.totalAulas();
        e.totalAulasFeitas = r.totalAulasFeitas();
        e.totalAulasPresente = r.totalAulasPresente();
        e.totalAulasMeiaPresenca = r.totalAulasMeiaPresenca();
        e.totalFaltas = r.totalFaltas();
        e.cancelamentoProprio = r.cancelamentoProprio();
        e.trocaTurma = r.trocaTurma();
        e.cancelamentoId = r.cancelamentoId();
    }

    private MatriculaResponse toResponse(Matricula e) {
        return new MatriculaResponse(e.id, e.oferecimentoComponenteCurricularId, e.contratoId, e.cadernoComponenteCurricularId, e.formaPagamentoId, e.dataCancelamento, e.motivoCancelamento, e.status, e.mediaFinal, e.percentualPresenca, e.qtdeChamadaFrequencia, e.data, e.totalAulas, e.totalAulasFeitas, e.totalAulasPresente, e.totalAulasMeiaPresenca, e.totalFaltas, e.cancelamentoProprio, e.trocaTurma, e.cancelamentoId);
    }


    // Migrado de MatriculaController.autoCompleterematricula (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:216, camada controller)
    // Logica original (adaptar):
    // public List<Curriculo> autoCompleterematricula(String query) {
    //         if(!ObjectUtil.nullOrEmpty(getEntity()) && !ObjectUtil.nullOrEmpty(getEntity().getContrato()) && !ObjectUtil.nullOrEmpty(getEntity().getContrato().getPessoa())){
    //             if (query.equals("")) {
    //                 return curriculoService.unidadesCursorematricula(usuarioLogadoController.getUnidadesDisponiveis(), getEntity().getContrato().getPessoa());
    //             }
    //             return curriculoService.autoCompleteComUnidadesrematricula(query.toLowerCase(), usuarioLogadoController.getUnidadesDisponiveis(), getEntity().getContrato().getPessoa());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleterematricula(String query) {
        // Obs: depende do microservico curriculo (curriculoService) e do usuario logado
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MatriculaController.gerarCarneConsultor (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:745, camada controller)
    // Logica original (adaptar):
    // private String gerarCarneConsultor() {
    //         compromisso = compromissoController.getEntity();
    //         saveOrUpdate(false);
    //         verificaMatriculaFinalizada = true;
    //         compromisso = new Compromisso();
    //         return "";
    //     }
    public Uni<String> gerarCarneConsultor() {
        // Obs: regra de negocio original e de UI/persistencia (compromissoController)
        return Uni.createFrom().item(null);
    }


    // Migrado de MatriculaController.verificaRequisito (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:1143, camada controller)
    // Observacao: retorno: era OferecimentoComponenteCurricularWrapper no legado; parametro wrapper: era OferecimentoComponenteCurricularWrapper no legado
    // Logica original (adaptar):
    // private OferecimentoComponenteCurricularWrapper verificaRequisito(OferecimentoComponenteCurricularWrapper wrapper, List<RequisitoMatriz> requisitosMatriz) {
    //         for (RequisitoMatriz requisitoMatriz : requisitosMatriz) {
    //             if (requisitoMatriz.getMatrizCurricular().getComponenteCurricular().equals(wrapper.getOferecimentoComponenteCurricular().getComponenteCurricular())) {
    //                 //TODO: setar disabled e habilitar quando selecionar seu pré requisito.
    //                 wrapper.setDisabledRequisito(true);
    //                 wrapper.setMotivo(wrapper.getMotivo() + "Precisa do requisito " + requisitoMatriz.getMatrizCurricularRequisito().getComponenteCurricular().getDescricao() + " ...
    public Uni<String> verificaRequisito(String wrapper, List<Long> requisitosMatriz) {
        // Obs: regra de negocio original e de UI (wrapper OferecimentoComponenteCurricularWrapper) e depende do microservico curriculo (RequisitoMatriz)
        return Uni.createFrom().item(null);
    }


    // Migrado de MatriculaController.buscarRequisitos (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:1262, camada controller)
    // Observacao: parametro curriculoId: era Curriculo (referencia por id)
    // Logica original (adaptar):
    // private void buscarRequisitos(Curriculo curriculo) {
    //         requisitosRequisitoMatriz = adicionarRequisitosMatriz(curriculo, curriculoService, requisitoMatrizService);;
    //     }
    public Uni<Void> buscarRequisitos(Long curriculoId) {
        // Obs: depende do microservico curriculo (RequisitoMatriz)
        return Uni.createFrom().voidItem();
    }


    // Migrado de MatriculaController.buscarDiasPagamento (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:1813, camada controller)
    // Logica original (adaptar):
    // public void buscarDiasPagamento() {
    //         diasPagamento = new ArrayList<>();
    //         if (!ObjectUtil.nullOrEmpty(dataPrimeiraParcela)) {
    //             List<DiaPagamento> dias = diaPagamentoService.findAll();
    //             Date dataInicial = dataPrimeiraParcela;
    //             Date dataFinal = DateUtil.somarDias(dataPrimeiraParcela, configuracaoParcela.getPrazoParcSegunda());
    //             diasPagamento = GestaoAlunoController.gerarDataParcela(dias, dataInicial, dataFinal);
    //         }
    //         if (!ObjectUtil.nullOrEmpty(parcelasSelecionadas)) {
    //             if (parcelasSelecionadas.size() == 1) {
    //                 if (parcelasSelecionadas.get(0).getParcela() > 0) {
    //                     parcelasSelecionad ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarDiasPagamento() {
        // Obs: regra de negocio original e de UI e depende do microservico financeiro (DiaPagamento)
        return Uni.createFrom().voidItem();
    }


    // Migrado de MatriculaController.buscarParcelas (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:1839, camada controller)
    // Logica original (adaptar):
    // public void buscarParcelas() {
    //         descontoBolsa = false;
    //         parcelasSelecionadas = new ArrayList<>();
    //         Parcela parcela = new Parcela();
    //         if (!ObjectUtil.nullOrEmpty(taxaCursos)) {
    //             parcela.setParcela(0);
    //             parcela.setDataVencimento(new Date());
    //             parcela.setContrato(getEntity().getContrato());
    //             if (getEntity().getContrato().getTaxaCurso() != null) {
    //                 getEntity().getContrato().setValorTaxa(getEntity().getContrato().getTaxaCurso().getValor());
    //                 parcela.setValor(getEntity().getContrato().getTaxaCurso().getValor());
    //             }
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarParcelas() {
        // Obs: regra de negocio original e de UI (parcelasSelecionadas)
        return Uni.createFrom().voidItem();
    }


    // Migrado de MatriculaController.buscarValorCurso (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:1997, camada controller)
    // Observacao: retorno: era ValorCurso (referencia por id)
    // Logica original (adaptar):
    // private ValorCurso buscarValorCurso() {
    //         return matriculaService.buscarValorCurso(getEntity().getContrato().getCurriculo(), getEntity().getContrato().getUnidade());
    //     }
    public Uni<Long> buscarValorCurso() {
        // Obs: depende do estado da tela (getEntity().getContrato()) e do microservico contrato
        return Uni.createFrom().item(null);
    }


    // Migrado de MatriculaController.verificarParcelaEditavel (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/MatriculaController.java:2001, camada controller)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public boolean verificarParcelaEditavel(Parcela parcela) {
    //         if (aluno) {
    //             int parc = (int) (parcelasSelecionadas.size() * (getEntity().getContrato().getFormaPagamento().getAjusteParcelaAluno().floatValue() / 100));
    //             if (parcela.getParcela() <= parc) {
    //                 return true;
    //             }
    //         } else {
    //             int parc = (int) (parcelasSelecionadas.size() * (getEntity().getContrato().getFormaPagamento().getAjusteParcela().floatValue() / 100));
    //             if (parcela.getParcela() <= parc) {
    //                 return true;
    //             }
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<Boolean> verificarParcelaEditavel(Long parcelaId) {
        // Obs: regra de negocio original e de UI (parcelasSelecionadas, contrato)
        return Uni.createFrom().item(false);
    }

    public Uni<List<Long>> buscarMatriculasPorOferecimento(Long oferecimentoComponenteCurricularId) {
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidadeResponsavel.ativo = true
        return repository.find("oferecimentoComponenteCurricularId = ?1 and dataCancelamento is null order by contrato.pessoa.pessoaFisica.nome", oferecimentoComponenteCurricularId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarValorCurso2(Long curriculoId, Long unidadeId) {
        return repository.buscarValorCurso(curriculoId, unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarComponentesAprovadosPorAlunos(Long pessoaId) {
        return repository.buscarComponentesAprovadosPorAlunos(pessoaId).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarMatriculasPorContrato(Long contratoId) {
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidadeResponsavel.ativo = true
        return repository.find("contratoId = ?1 order by oferecimentoComponenteCurricular.dataInicio, id,oferecimentoComponenteCurricular.id", contratoId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarMatriculasComCadernoPorContrato(Long contratoId) {
        return repository.buscarMatriculasComCadernoPorContrato(contratoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MatriculaService.buscarMatriculasAtivasNaoConcluidas (src/main/java/br/com/sol7/olimpio/service/services/educacao/MatriculaService.java:97, camada service)
    // Observacao: parametro contratoId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public List<Matricula> buscarMatriculasAtivasNaoConcluidas(Contrato contrato) {
    //         return getMatriculaRepository().buscarMatriculasAtivasNaoConcluidas(contrato);
    //     }
    public Uni<List<Long>> buscarMatriculasAtivasNaoConcluidas(Long contratoId) {
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidadeResponsavel.ativo = true
        return repository.find("contratoId = ?1 and dataCancelamento is null and status ='CURSANDO'", contratoId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarMatriculasCanceladas(Long contratoId) {
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): m.contrato.unidadeResponsavel.ativo = true
        // Obs: condicao removida (depende de outro microservico): m.oferecimentoComponenteCurricular.status <> 'CANCELADA'
        // Obs: condicao removida (depende de outro microservico): m.contrato.ativo = false
        return repository.find("contratoId = ?1 and dataCancelamento is not null", contratoId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // exibidos ao selecionar um aluno na tela de matricula.
    public Uni<InfoPessoaFisicaResponse> calcularInfoPessoaFisica(Long pessoaId) {
        return PessoaFisica.find("pessoaId", pessoaId).firstResult().chain(pfObj -> {
            PessoaFisica pf = pfObj instanceof PessoaFisica ? (PessoaFisica) pfObj : null;
            String cpf = pf != null ? pf.cpf : null;
            LocalDate dataNascimento = pf != null ? pf.dataNascimento : null;
            LocalDate dataAlteracao = null;

            Uni<Boolean> temContratoUni = contratoRepository.validaAluno(pessoaId)
                    .map(list -> list != null && !list.isEmpty());
            Uni<Boolean> cpfAntigoUni = cpf == null || cpf.isBlank()
                    ? Uni.createFrom().item(false)
                    : repository.contarCpfAlunoAntigo(cpf).map(result -> contarTotal(result) > 0);
            Uni<Boolean> financeiroUni = repository.contarParcelasAtrasadas(pessoaId)
                    .map(result -> contarTotal(result) > 0);
            Uni<Integer> diasUni = repository.buscarValorConfig("DIAS_ATUALIZAR_ALUNO")
                    .map(result -> parseDias(result == null || result.isEmpty() ? null : result.get(0)));

            return Uni.combine().all().unis(temContratoUni, cpfAntigoUni, financeiroUni, diasUni).asTuple()
                    .map(combinado -> {
                        boolean aluno = Boolean.TRUE.equals(combinado.getItem1())
                                || Boolean.TRUE.equals(combinado.getItem2());
                        boolean financeiro = Boolean.TRUE.equals(combinado.getItem3());
                        // Menor de idade quando ainda nao completou 18 anos.
                        boolean deMenor = dataNascimento != null
                                && dataNascimento.plusYears(18).isAfter(LocalDate.now());
                        // Precisa atualizar quando nunca foi alterado ou esta desatualizado ha mais de N dias.
                        boolean atualizar = dataAlteracao == null
                                || dataAlteracao.isBefore(LocalDate.now().minusDays(combinado.getItem4()));

                        return new InfoPessoaFisicaResponse(
                                deMenor ? "DE MENOR" : "DE MAIOR",
                                financeiro ? "COM DÍVIDAS" : "SEM DÍVIDAS",
                                aluno ? "SIM" : "NÃO",
                                atualizar ? "SIM" : "NÃO");
                    });
        });
    }

    private static long contarTotal(List<Tuple> rows) {
        if (rows == null || rows.isEmpty()) {
            return 0L;
        }
        Long total = TupleHelper.getLong(rows.get(0), "total");
        return total == null ? 0L : total;
    }

    private static int parseDias(Tuple row) {
        String valor = TupleHelper.getString(row, "valor");
        if (valor == null || valor.isBlank()) {
            return 0;
        }
        try {
            return Math.max(0, Integer.parseInt(valor.trim()));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private static LocalDate parseLocalDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.length() > 10 ? value.substring(0, 10) : value);
        } catch (Exception e) {
            return null;
        }
    }

}

