package br.com.sol7.olimpio.educacao.contrato;

import br.com.sol7.olimpio.educacao.contrato.dto.ContratoAutoCompleteResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ContratoService {

    @Inject
    ContratoRepository repository;

    public Uni<List<ContratoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ContratoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ContratoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Contrato not found"))
                .map(this::toResponse);
    }

    public Uni<ContratoResponse> create(ContratoRequest r) {
        var e = new Contrato();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ContratoResponse> update(Long id, ContratoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Contrato not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Contrato not found")));
    }

    private void apply(Contrato e, ContratoRequest r) {
        e.curriculoId = r.curriculoId();
        e.unidadeId = r.unidadeId();
        e.unidadeResponsavelId = r.unidadeResponsavelId();
        e.ultimoContratoId = r.ultimoContratoId();
        e.contratoAnteriorId = r.contratoAnteriorId();
        e.compromissoId = r.compromissoId();
        e.valorCursoId = r.valorCursoId();
        e.pessoaId = r.pessoaId();
        e.descontoCursoId = r.descontoCursoId();
        e.taxaCursoId = r.taxaCursoId();
        e.formaPagamentoId = r.formaPagamentoId();
        e.valorDesconto = r.valorDesconto();
        e.valorTaxa = r.valorTaxa();
        e.responsavelId = r.responsavelId();
        e.dataConclusao = r.dataConclusao();
        e.local = r.local();
        e.usuarioId = r.usuarioId();
        e.testemunha1Id = r.testemunha1Id();
        e.testemunha2Id = r.testemunha2Id();
        e.ativo = r.ativo();
        e.inscricao = r.inscricao();
        e.desistente = r.desistente();
        e.contratoDesistenteId = r.contratoDesistenteId();
        e.pdf = r.pdf();
        e.data = r.data();
        e.dataReparcelamento = r.dataReparcelamento();
        e.dataCancelamento = r.dataCancelamento();
        e.qtdeReparcelamento = r.qtdeReparcelamento();
        e.cadernoComponenteCurricularId = r.cadernoComponenteCurricularId();
        e.ultimaParcelaId = r.ultimaParcelaId();
        e.cancelamentoId = r.cancelamentoId();
        e.proximaParcelaId = r.proximaParcelaId();
        e.oferecimentoInicioId = r.oferecimentoInicioId();
        e.oferecimentoFimId = r.oferecimentoFimId();
        e.qtdParcelasAtrasadas = r.qtdParcelasAtrasadas();
        e.qtdParcelasNaoPagas = r.qtdParcelasNaoPagas();
        e.valorParcelas = r.valorParcelas();
        e.trocaTurma = r.trocaTurma();
    }

    private ContratoResponse toResponse(Contrato e) {
        return new ContratoResponse(e.id, e.curriculoId, e.unidadeId, e.unidadeResponsavelId, e.ultimoContratoId, e.contratoAnteriorId, e.compromissoId, e.valorCursoId, e.pessoaId, e.descontoCursoId, e.taxaCursoId, e.formaPagamentoId, e.valorDesconto, e.valorTaxa, e.responsavelId, e.dataConclusao, e.local, e.usuarioId, e.testemunha1Id, e.testemunha2Id, e.ativo, e.inscricao, e.desistente, e.contratoDesistenteId, e.pdf, e.data, e.dataReparcelamento, e.dataCancelamento, e.qtdeReparcelamento, e.cadernoComponenteCurricularId, e.ultimaParcelaId, e.cancelamentoId, e.proximaParcelaId, e.oferecimentoInicioId, e.oferecimentoFimId, e.qtdParcelasAtrasadas, e.qtdParcelasNaoPagas, e.valorParcelas, e.trocaTurma);
    }


    // Migrado de ContratoController.autoCompleteContrato (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ContratoController.java:146, camada controller)
    // Logica original (adaptar):
    // public List<Contrato> autoCompleteContrato(String query) {
    // 
    //         try {
    //             FacesContext context = FacesContext.getCurrentInstance();
    //             Pessoa pessoa = (Pessoa) UIComponent.getCurrentComponent(context).getAttributes().get("filter");
    //             if (query.equals("")) {
    //                 return contratoService.buscarContratoPessoa(pessoa);
    //             } else {
    //                 return contratoService.autoCompleteContrato(query, pessoa);
    //             }
    //         } catch (Exception e) {
    //             e.printStackTrace();
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteContrato(String query, Long pessoaId) {
        if (pessoaId == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        if (query == null || query.isBlank()) {
            return repository.find("pessoaId = ?1 order by id desc", pessoaId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoCompleteContrato(query.toLowerCase().trim(), pessoaId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ContratoController.verificaRequisito (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ContratoController.java:258, camada controller)
    // Observacao: retorno: era OferecimentoComponenteCurricularWrapper no legado; parametro wrapper: era OferecimentoComponenteCurricularWrapper no legado
    // Logica original (adaptar):
    // public OferecimentoComponenteCurricularWrapper verificaRequisito(OferecimentoComponenteCurricularWrapper wrapper, List<RequisitoMatriz> requisitosMatriz) {
    //         for (RequisitoMatriz requisitoMatriz : requisitosMatriz) {
    //             if (requisitoMatriz.getMatrizCurricular().getComponenteCurricular().equals(wrapper.getOferecimentoComponenteCurricular().getComponenteCurricular())) {
    //                 //TODO: setar disabled e habilitar quando selecionar seu pré requisito.
    //                 wrapper.setDisabledRequisito(true);
    //                 wrapper.setMotivo(wrapper.getMotivo() + "Precisa do requisito " + requisitoMatriz.getMatrizCurricular().getComponenteCurricular().getDescricao() + " antes da  ...
    public Uni<String> verificaRequisito(String wrapper, List<Long> requisitosMatriz) {
        // Obs: logica de UI (wrapper/disabled/motivo) do controller JSF; sem logica de dados portaavel
        return Uni.createFrom().item(null);
    }


    // Migrado de ContratoService.buscarContratosPessoa (src/main/java/br/com/sol7/olimpio/service/services/educacao/ContratoService.java:33, camada service)
    // Observacao: parametro pessoaId: era Pessoa (referencia por id)
    // Logica original (adaptar):
    // public List<Contrato> buscarContratosPessoa(Pessoa pessoa) {
    //         return getContratoRepository().buscarContratosPessoa(pessoa);
    //     }
    public Uni<List<Long>> buscarContratosPessoa(Long pessoaId) {
        // Obs: condicao removida (depende de outro microservico): c.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): c.unidadeResponsavel.ativo = true
        return repository.find("pessoaId = ?1 order by id desc", pessoaId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ContratoService.buscarResponsaveisPessoa (src/main/java/br/com/sol7/olimpio/service/services/educacao/ContratoService.java:53, camada service)
    // Observacao: parametro pessoaId: era Pessoa (referencia por id)
    // JPQL original: Select distinct c.responsavel from Contrato c where c.pessoa = ?1 and c.responsavel is not null
    // Logica original (adaptar):
    // public List<Pessoa> buscarResponsaveisPessoa(Pessoa pessoa) {
    //         return getContratoRepository().buscarResponsaveisPessoa(pessoa);
    //     }
    public Uni<List<Long>> buscarResponsaveisPessoa(Long pessoaId) {
        return repository.buscarResponsaveisPessoa(pessoaId)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de ContratoService.autoCompleteContrato (src/main/java/br/com/sol7/olimpio/service/services/educacao/ContratoService.java:57, camada service)
    // Observacao: parametro pessoaId: era Pessoa (referencia por id)
    // JPQL original: select distinct c from Contrato c where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and c.pessoa in (?2) and  lower(c.curriculo.sucinto) like '%' || ?1 || '%' OR str(c.id) like '%' || ?1 || '%' OR  lower(c.curriculo.curso.nome) like '%' || ?1 || '%'
    // Logica original (adaptar):
    // public List<Contrato> autoCompleteContrato(String query, Pessoa pessoa) {
    //         return this.getContratoRepository().autoCompleteContrato(query.toLowerCase().trim(), pessoa, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteContrato2(String query, Long pessoaId) {
        return repository.autoCompleteContrato(query.toLowerCase().trim(), pessoaId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ContratoService.buscarContratoPessoa (src/main/java/br/com/sol7/olimpio/service/services/educacao/ContratoService.java:61, camada service)
    // Observacao: parametro pessoaId: era Pessoa (referencia por id)
    // Logica original (adaptar):
    // public List<Contrato> buscarContratoPessoa(Pessoa pessoa) {
    //         return this.getContratoRepository().buscarContratoPessoa(pessoa, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> buscarContratoPessoa(Long pessoaId) {
        // Obs: condicao removida (depende de outro microservico): c.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): c.unidadeResponsavel.ativo = true
        return repository.find("pessoaId in (?1)", pessoaId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ContratoService.autoCompleteAluno (src/main/java/br/com/sol7/olimpio/service/services/educacao/ContratoService.java:73, camada service)
    // JPQL original: select distinct p from Contrato c inner join c.pessoa p inner join p.unidades u  where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and  (u in (?2) or c.unidadeResponsavel in (?2)) and (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%')
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteAluno(String query) {
    //         return this.getContratoRepository().autoCompleteAluno(query.toLowerCase().trim(), usuarioLogadoController.getUnidadesDisponiveis(), new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<ContratoAutoCompleteResponse>> autoCompleteAluno(String query) {
        if (query == null || query.trim().length() < 3) {
            return Uni.createFrom().item(java.util.List.of());
        }
        String q = query.toLowerCase().trim();
        return repository.autoCompleteAlunoNome(q).map(list -> list.stream()
                .map(row -> {
                    Object[] arr = (Object[]) row;
                    Long id = ((Number) arr[0]).longValue();
                    String nome = arr[1] == null ? "" : arr[1].toString();
                    return new ContratoAutoCompleteResponse(id, nome);
                })
                .toList());
    }


    // Migrado de ContratoService.autoCompleteAlunoPagamentoPendenteUnidade (src/main/java/br/com/sol7/olimpio/service/services/educacao/ContratoService.java:77, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: select distinct p from Contrato c inner join c.pessoa p inner join p.unidades u  where  c.unidade.ativo = true and c.unidadeResponsavel = ?2 and  (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%') and exists(select par from Parcela par where par.dataPagamento is null and par.dataCancelamento is null and par.contrato = c)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteAlunoPagamentoPendenteUnidade(String query, Unidade unidade) {
    //         return this.getContratoRepository().autoCompleteAlunoPagamentoPendenteUnidade(query.toLowerCase().trim(), unidade, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteAlunoPagamentoPendenteUnidade(String query, Long unidadeId) {
        if (unidadeId == null || query == null || query.trim().isEmpty()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoCompleteAlunoPagamentoPendenteUnidade(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de ContratoService.autoCompleteAlunoPagamentoPendente (src/main/java/br/com/sol7/olimpio/service/services/educacao/ContratoService.java:81, camada service)
    // JPQL original: select distinct p from Contrato c inner join c.pessoa p inner join p.unidades u  where  c.unidade.ativo = true and c.unidadeResponsavel.ativo = true and  (u in (?2) or c.unidadeResponsavel in (?2)) and (lower(p.pessoaFisica.nome) like '%' || ?1 || '%' OR (p.pessoaFisica.cpf) like '%' || ?1 || '%') and exists(select par from Parcela par where par.dataPagamento is null and par.dataCancelamento is null and par.contrato = c)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteAlunoPagamentoPendente(String query) {
    //         return this.getContratoRepository().autoCompleteAlunoPagamentoPendente(query.toLowerCase().trim(), usuarioLogadoController.getUnidadesDisponiveis(), new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteAlunoPagamentoPendente(String query, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty() || query == null || query.trim().isEmpty()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoCompleteAlunoPagamentoPendente(query.toLowerCase().trim(), unidadesIds).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

}

