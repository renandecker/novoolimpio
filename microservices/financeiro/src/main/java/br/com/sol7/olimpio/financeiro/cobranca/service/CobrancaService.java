package br.com.sol7.olimpio.financeiro.cobranca;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class CobrancaService {

    @Inject
    CobrancaRepository repository;

    // Obs: depende do microservico educacao/central (Contrato, Parcela, Config e TaskExecutor) - logica de particionamento em threads nao portada automaticamente, ver RELATORIO_SCHEDULE.md
    public Uni<Void> atualizarCobrancasAutomatico() {
        return Uni.createFrom().voidItem();
    }

    public Uni<List<CobrancaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CobrancaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CobrancaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Cobranca not found"))
                .map(this::toResponse);
    }

    public Uni<CobrancaResponse> create(CobrancaRequest r) {
        var e = new Cobranca();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CobrancaResponse> update(Long id, CobrancaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Cobranca not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Cobranca not found")));
    }

    private void apply(Cobranca e, CobrancaRequest r) {
        e.contratoId = r.contratoId();
        e.etapasCobrancaId = r.etapasCobrancaId();
        e.devendoDesde = r.devendoDesde();
        e.dataUltimaCarta = r.dataUltimaCarta();
        e.dataUltimoRetorno = r.dataUltimoRetorno();
        e.dataUltimaSms = r.dataUltimaSms();
        e.dataUltimaLigacao = r.dataUltimaLigacao();
        e.dataUltimoEmail = r.dataUltimoEmail();
        e.ligacaoCobrancaId = r.ligacaoCobrancaId();
        e.qtdLigacoes = r.qtdLigacoes();
        e.qtdEmails = r.qtdEmails();
        e.qtdCartas = r.qtdCartas();
        e.qtdSms = r.qtdSms();
    }

    private CobrancaResponse toResponse(Cobranca e) {
        return new CobrancaResponse(e.id, e.contratoId, e.etapasCobrancaId, e.devendoDesde, e.dataUltimaCarta, e.dataUltimoRetorno, e.dataUltimaSms, e.dataUltimaLigacao, e.dataUltimoEmail, e.ligacaoCobrancaId, e.qtdLigacoes, e.qtdEmails, e.qtdCartas, e.qtdSms);
    }


    // Migrado de CobrancaController.atualizar (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CobrancaController.java:221, camada controller)
    // Logica original (adaptar):
    // public void atualizar() {
    //         try {
    //             cobrancaService.atualizaCobrancasManual();
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.info", "validation", "Cobrança atualizado com sucesso.");
    //         } catch (Exception e) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.ERROR, "global.error", "global.insert.error", null, "Ocorreu um erro ao atualizar Cobrança");
    //             e.printStackTrace();
    //         }
    //     }
    public Uni<Void> atualizar() {
        return atualizarCobrancasAutomatico();
    }


    // Migrado de CobrancaController.carregarContrato (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CobrancaController.java:733, camada controller)
    // Logica original (adaptar):
    // public void carregarContrato(String cc) {
    //         this.contrato = contratoService.findById(Integer.valueOf(cc));
    //     }
    // Obs: depende do microservico educacao/central (contratoService) - Contrato nao existe neste microservico
    public Uni<Void> carregarContrato(String cc) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de CobrancaController.carregarDetalhes (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CobrancaController.java:737, camada controller)
    // Logica original (adaptar):
    // public void carregarDetalhes(String cc) {
    //         this.contrato = contratoService.findContratoById(Integer.valueOf(cc));
    //         this.contrato.setUnidadeResponsavel(unidadeService.buscarUnidadeComTelefones(contrato.getUnidadeResponsavel()));
    //         this.contrato.setUnidade(unidadeService.buscarUnidadeComTelefones(contrato.getUnidade()));
    //         this.contrato.getPessoa().getPessoaFisica().setPessoa(pessoaService.buscarPessoaComUnidades(contrato.getPessoa()));
    //         if (!ObjectUtil.nullOrEmpty(this.contrato.getResponsavel())) {
    //             this.contrato.getResponsavel().getPessoaFisica().setPessoa(pessoaService.buscarPessoaComUnidades(contrato.getResponsavel()));
    //         }
    // 
    //         FilterL ...
    // // ... (truncado, ver fonte original)
    // Obs: depende do microservico educacao/central (contratoService, unidadeService, pessoaService) e e metodo de UI (montagem de tela)
    public Uni<Void> carregarDetalhes(String cc) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de CobrancaService.buscarCobranca (src/main/java/br/com/sol7/olimpio/service/services/financeiro/CobrancaService.java:74, camada service)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public float buscarCobranca(Parcela parcela) {
    //         long quantidadeCobranca = ligacaoCobrancaService.quantidadesCobrancasFeitas(parcela.getContrato(), parcela.getDataVencimento());
    //         CustoServico custoServico = custoServicoService.buscarCustoServicoPorUnidade(parcela.getContrato().getUnidade());
    // 
    //         if (custoServico == null) {
    //             return 0;
    //         } else {
    //             return quantidadeCobranca * custoServico.getValorLigacao().floatValue();
    //         }
    //     }
    // Obs: depende do microservico educacao (Parcela/Contrato) e de LigacaoCobrancaService/CustoServicoService (entidades nao portadas neste microservico)
    public Uni<Float> buscarCobranca(Long parcelaId) {
        return Uni.createFrom().item(null);
    }

}
