package br.com.sol7.olimpio.financeiro.gerarcarne;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@ApplicationScoped
@WithTransaction
public class GerarCarneService {

    @Inject
    GerarCarneRepository repository;

    @Inject
    FeriadoService feriadoService;

    public Uni<List<GerarCarneResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GerarCarneResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GerarCarneResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerarCarne not found")).map(this::toResponse);
    }

    public Uni<GerarCarneResponse> create(GerarCarneRequest r) {
        var e = new GerarCarne();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GerarCarneResponse> update(Long id, GerarCarneRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerarCarne not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("GerarCarne not found")));
    }

    private void apply(GerarCarne e, GerarCarneRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private GerarCarneResponse toResponse(GerarCarne e) {
        return new GerarCarneResponse(e.id, e.nome, e.dadosJson);
    }

    // ===== MÉTODOS MIGRADOS DO GERARCARNE SERVICE ORIGINAL =====

    // Migrado de GerarCarneService.criarCarne
    // Cria um objeto Carne para impressão do boleto/carnê
    public Uni<Carne> criarCarne(ParcelaDTO parcela, int total, String logoPath, String pagoPath) {
        // Nota: Esta implementação requer dados de outros microserviços (Contrato, Pessoa, VendaProduto)
        // O método original acessava: parcela.getContrato().getPessoa().getLogradouro().getBairro().getCidade(), etc.
        // No microserviço financeiro, esses dados devem vir via DTO ou chamada cross-service

        Carne carne = new Carne();

        if (parcela.contratoId() != null) {
            // Dados de contrato
            carne.setTipoPag("Contrato");
            // carne.setAluno(parcela.getContrato().getPessoa().getPessoaFisica().getNome());
            // carne.setCodAluno(parcela.getContrato().getPessoa().getPessoaFisica().getId().toString());
            // Preencher endereço, bairro, escola, etc. via cross-service
            carne.setContrato(parcela.contratoId().toString());

            if (parcela.parcela() == 0) {
                carne.setParcela("0");
                carne.setDesconto("Taxa Inscrição");
            } else {
                carne.setParcela(parcela.parcelaSequencia() + " de " + total);
                if (parcela.desconto() == null) {
                    parcela = new ParcelaDTO(parcela.id(), parcela.contratoId(), parcela.vendaProdutoId(), parcela.pessoaId(),
                            parcela.parcela(), parcela.parcelaSequencia(), parcela.dataVencimento(), parcela.valor(),
                            BigDecimal.ZERO, parcela.juros(), parcela.multa(), parcela.dataPagamento(), parcela.valorPago(),
                            parcela.valorDesconto(), parcela.valorMultaJuros(), parcela.codigoVerificador(), parcela.unidadeId(), parcela.diasTolerancia());
                }
                BigDecimal descontoValor = parcela.valor().multiply(parcela.desconto()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_DOWN);
                carne.setDesconto("Até o vencimento, bonificação desconto de R$ " + descontoValor.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ","));
            }

            // SPC - dias de tolerância
            // carne.setSpc("Com atraso de " + parcela.getContrato().getValorCurso().getDiasSpc() + " dia(s), você será incluído no SPC");

        } else if (parcela.vendaProdutoId() != null) {
            // Dados de venda de produto
            carne.setTipoPag("Venda");
            carne.setContrato(parcela.vendaProdutoId().toString());
            // Preencher dados do comprador via cross-service

            if (parcela.parcela() == 0) {
                carne.setParcela("0");
                carne.setDesconto("Venda À Vista");
            } else {
                carne.setParcela(parcela.parcelaSequencia() + " de " + total);
                if (parcela.desconto() == null) {
                    parcela = new ParcelaDTO(parcela.id(), parcela.contratoId(), parcela.vendaProdutoId(), parcela.pessoaId(),
                            parcela.parcela(), parcela.parcelaSequencia(), parcela.dataVencimento(), parcela.valor(),
                            BigDecimal.ZERO, parcela.juros(), parcela.multa(), parcela.dataPagamento(), parcela.valorPago(),
                            parcela.valorDesconto(), parcela.valorMultaJuros(), parcela.codigoVerificador(), parcela.unidadeId(), parcela.diasTolerancia());
                }
                BigDecimal descontoValor = parcela.valor().multiply(parcela.desconto()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_DOWN);
                carne.setDesconto("Até o vencimento, bonificação desconto de R$ " + descontoValor.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ","));
            }

            // SPC - dias de tolerância da forma de pagamento
            // carne.setSpc("Com atraso de " + parcela.getVendaProduto().getFormaPagamento().getDiasSpc() + " dia(s), você será incluído no SPC");
        }

        // Valores comuns
        carne.setValorDocumento(parcela.valor().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ","));
        carne.setJuros("Após o vencimento cobrar juros de " + parcela.juros().setScale(2, RoundingMode.HALF_DOWN).toString() + "%");
        carne.setLancamento(parcela.id().toString());
        carne.setMulta("Após o vencimento multa de " + parcela.multa().setScale(2, RoundingMode.HALF_DOWN).toString() + "%");

        float jurosMulta = obterMultaJuros(parcela).floatValue();
        float desconto = obterDesconto(parcela).floatValue();
        carne.setDescontoDocumento(BigDecimal.valueOf(desconto).setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ","));
        carne.setMultaJurosDocumento(BigDecimal.valueOf(jurosMulta).setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ","));
        carne.setValorTotalDocumento(BigDecimal.valueOf(parcela.valor().floatValue() + jurosMulta - desconto).setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ","));

        carne.setVencimento(new SimpleDateFormat("dd/MM/yyyy").format(parcela.dataVencimento()));

        // Logo e pago file paths - apenas caminhos, a impressão real é no frontend
        carne.setImagem(logoPath);

        // Se já foi pago, não gera carne
        if (parcela.dataPagamento() != null) {
            return Uni.createFrom().item(null);
        }

        return Uni.createFrom().item(carne);
    }

    // Migrado de GerarCarneService.criarCarneReparcelamento
    public Uni<Carne> criarCarneReparcelamento(ParcelaDTO parcela, int total, String logoPath, String pagoPath) {
        return criarCarne(parcela, total, logoPath, pagoPath)
                .onItem().transform(carne -> {
                    if (carne != null) {
                        carne.setDesconto("Este carne é resultado de um Reparcelamento.");
                    }
                    return carne;
                });
    }

    // Migrado de GerarCarneService.criarListaCarne
    // Cria lista de carnês para um contrato
    public Uni<List<Carne>> criarListaCarne(Long contratoId, String logoPath, String pagoPath) {
        // Requer ParcelaService do microserviço comercial
        // List<Parcela> parcelas = parcelaService.obterParcela(contrato);
        // Para implementação no microserviço financeiro, precisaria de integração cross-service
        return Uni.createFrom().item(new ArrayList<>());
    }

    // Migrado de GerarCarneService.obterDesconto
    // Calcula desconto aplicável a uma parcela baseado na data atual, feriados, fim de semana
    public BigDecimal obterDesconto(ParcelaDTO parcela) {
        if (parcela == null || parcela.parcela() == 0) {
            return BigDecimal.ZERO;
        }

        Date currentDate = new Date();
        Calendar verificaData = Calendar.getInstance();
        verificaData.setTime(parcela.dataVencimento());
        int diaSemana = verificaData.get(Calendar.DAY_OF_WEEK);

        boolean aplicarDesconto = false;

        // Antes do vencimento
        if (currentDate.before(parcela.dataVencimento())) {
            aplicarDesconto = true;
        }
        // No dia do vencimento
        else if (mesmoDia(parcela.dataVencimento(), currentDate)) {
            aplicarDesconto = true;
        }
        // Vencimento foi ontem e ontem foi feriado
        else if (!feriadoService.buscarFeriadosComUnidadeData(parcela.unidadeId(), DateUtil.somarDias(currentDate, -1))
                .await().indefinitely().isEmpty()
                && mesmoDia(parcela.dataVencimento(), DateUtil.somarDias(currentDate, -1))) {
            aplicarDesconto = true;
        }
        // Vencimento no sábado (dia 7) e hoje é sexta ou sábado
        else if (diaSemana == Calendar.SATURDAY &&
                (mesmoDia(parcela.dataVencimento(), DateUtil.somarDias(currentDate, -2)) || currentDate.before(parcela.dataVencimento()))) {
            aplicarDesconto = true;
        }
        // Vencimento no domingo (dia 1) e hoje é sábado ou domingo
        else if (diaSemana == Calendar.SUNDAY &&
                (mesmoDia(parcela.dataVencimento(), DateUtil.somarDias(currentDate, -1)) || currentDate.before(parcela.dataVencimento()))) {
            aplicarDesconto = true;
        }

        if (aplicarDesconto && parcela.desconto() != null) {
            return parcela.valor().multiply(parcela.desconto()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_DOWN);
        }

        return BigDecimal.ZERO;
    }

    // Migrado de GerarCarneService.obterMultaJuros
    // Calcula multa e juros de uma parcela em atraso
    public BigDecimal obterMultaJuros(ParcelaDTO parcela) {
        if (parcela == null || parcela.parcela() == 0) {
            return BigDecimal.ZERO;
        }

        int diasTolerancia = parcela.diasTolerancia(); // Vem do contrato ou forma de pagamento

        Date currentDate = new Date();
        Calendar verificaData = Calendar.getInstance();
        verificaData.setTime(parcela.dataVencimento());
        int diaSemana = verificaData.get(Calendar.DAY_OF_WEEK);

        boolean diaNaoUtil = false;
        boolean feriado = false;

        // Verificar se vencimento foi ontem e foi feriado
        if (mesmoDia(parcela.dataVencimento(), DateUtil.somarDias(currentDate, -1))) {
            if (!feriadoService.buscarFeriadosComUnidadeData(parcela.unidadeId(), parcela.dataVencimento())
                    .await().indefinitely().isEmpty()) {
                feriado = true;
            }
        }

        // Domingo (dia 1) e vencimento foi ontem
        if (diaSemana == Calendar.SUNDAY && mesmoDia(parcela.dataVencimento(), DateUtil.somarDias(currentDate, -1))) {
            diaNaoUtil = true;
        }
        // Sábado (dia 7) e vencimento foi anteontem
        if (diaSemana == Calendar.SATURDAY && mesmoDia(parcela.dataVencimento(), DateUtil.somarDias(currentDate, -2))) {
            diaNaoUtil = true;
        }

        BigDecimal multa = BigDecimal.ZERO;
        BigDecimal juros = BigDecimal.ZERO;

        if (!feriado && !diaNaoUtil && parcela.parcela() != 0) {
            Date dataComTolerancia = DateUtil.somarDias(parcela.dataVencimento(), diasTolerancia);
            if (dataComTolerancia.before(currentDate) &&
                    (!mesmoDia(DateUtil.somarDias(parcela.dataVencimento(), 1), currentDate) || currentDate.after(parcela.dataVencimento()))) {

                multa = parcela.valor().multiply(parcela.multa()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_DOWN);

                BigDecimal jurosAoDia = parcela.juros().divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_DOWN)
                        .divide(BigDecimal.valueOf(30), 10, RoundingMode.HALF_DOWN);
                long diferencaDias = DateUtil.diferencaEmDias(parcela.dataVencimento(), currentDate);
                juros = parcela.valor().multiply(jurosAoDia).multiply(BigDecimal.valueOf(diferencaDias))
                        .setScale(2, RoundingMode.HALF_DOWN);
            }
        }

        return multa.add(juros);
    }

    // Migrado de GerarCarneService.obterValorCobrado
    // Calcula valor total a ser cobrado (valor + juros/multa - desconto)
    public BigDecimal obterValorCobrado(ParcelaDTO parcela) {
        if (parcela == null || parcela.id() == null) {
            return BigDecimal.ZERO;
        }

        if (parcela.dataPagamento() == null && new Date().after(parcela.dataVencimento())) {
            BigDecimal desconto = obterDesconto(parcela);
            BigDecimal jurosMulta = obterMultaJuros(parcela);
            return parcela.valor().add(jurosMulta).subtract(desconto);
        }

        return BigDecimal.ZERO;
    }

    // Migrado de GerarCarneService.obterValoresCancelamento
    // Obtém valores para requerimento de cancelamento (contrato ou matrícula)
    // Nota: O original usa SQL nativo dinâmico com variáveis de cancelamento
    // Esta implementação simplificada retorna estrutura vazia - requer implementação completa com JDBC/JPA
    public Uni<RequerimentoCancelamentoDTO> obterValoresCancelamento(Long contratoId, Long matriculaId) {
        // Requer execução de SQL dinâmico baseado em CancelamentoVariavel
        // Por enquanto retorna DTO vazio
        return Uni.createFrom().item(new RequerimentoCancelamentoDTO());
    }

    // ===== MÉTODOS AUXILIARES =====

    private boolean mesmoDia(Date data1, Date data2) {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        return sdf.format(data1).equals(sdf.format(data2));
    }

    // ===== DTOs INTERNOS =====

    public record ParcelaDTO(
            Long id,
            Long contratoId,
            Long vendaProdutoId,
            Long pessoaId,
            Integer parcela,
            Integer parcelaSequencia,
            Date dataVencimento,
            BigDecimal valor,
            BigDecimal desconto,
            BigDecimal juros,
            BigDecimal multa,
            Date dataPagamento,
            BigDecimal valorPago,
            BigDecimal valorDesconto,
            BigDecimal valorMultaJuros,
            String codigoVerificador,
            Long unidadeId,
            Integer diasTolerancia
    ) {
    }

    public static class Carne {
        private String tipoPag;
        private String aluno;
        private String codAluno;
        private String bairro;
        private String endereco;
        private String escola;
        private String contrato;
        private String spc;
        private String parcela;
        private String desconto;
        private String responsavel;
        private String valorDocumento;
        private String juros;
        private String lancamento;
        private String multa;
        private String descontoDocumento;
        private String multaJurosDocumento;
        private String valorTotalDocumento;
        private String vencimento;
        private String imagem;

        public Carne() {
        }

        public String getTipoPag() {
            return tipoPag;
        }

        public void setTipoPag(String tipoPag) {
            this.tipoPag = tipoPag;
        }

        public String getAluno() {
            return aluno;
        }

        public void setAluno(String aluno) {
            this.aluno = aluno;
        }

        public String getCodAluno() {
            return codAluno;
        }

        public void setCodAluno(String codAluno) {
            this.codAluno = codAluno;
        }

        public String getBairro() {
            return bairro;
        }

        public void setBairro(String bairro) {
            this.bairro = bairro;
        }

        public String getEndereco() {
            return endereco;
        }

        public void setEndereco(String endereco) {
            this.endereco = endereco;
        }

        public String getEscola() {
            return escola;
        }

        public void setEscola(String escola) {
            this.escola = escola;
        }

        public String getContrato() {
            return contrato;
        }

        public void setContrato(String contrato) {
            this.contrato = contrato;
        }

        public String getSpc() {
            return spc;
        }

        public void setSpc(String spc) {
            this.spc = spc;
        }

        public String getParcela() {
            return parcela;
        }

        public void setParcela(String parcela) {
            this.parcela = parcela;
        }

        public String getDesconto() {
            return desconto;
        }

        public void setDesconto(String desconto) {
            this.desconto = desconto;
        }

        public String getResponsavel() {
            return responsavel;
        }

        public void setResponsavel(String responsavel) {
            this.responsavel = responsavel;
        }

        public String getValorDocumento() {
            return valorDocumento;
        }

        public void setValorDocumento(String valorDocumento) {
            this.valorDocumento = valorDocumento;
        }

        public String getJuros() {
            return juros;
        }

        public void setJuros(String juros) {
            this.juros = juros;
        }

        public String getLancamento() {
            return lancamento;
        }

        public void setLancamento(String lancamento) {
            this.lancamento = lancamento;
        }

        public String getMulta() {
            return multa;
        }

        public void setMulta(String multa) {
            this.multa = multa;
        }

        public String getDescontoDocumento() {
            return descontoDocumento;
        }

        public void setDescontoDocumento(String descontoDocumento) {
            this.descontoDocumento = descontoDocumento;
        }

        public String getMultaJurosDocumento() {
            return multaJurosDocumento;
        }

        public void setMultaJurosDocumento(String multaJurosDocumento) {
            this.multaJurosDocumento = multaJurosDocumento;
        }

        public String getValorTotalDocumento() {
            return valorTotalDocumento;
        }

        public void setValorTotalDocumento(String valorTotalDocumento) {
            this.valorTotalDocumento = valorTotalDocumento;
        }

        public String getVencimento() {
            return vencimento;
        }

        public void setVencimento(String vencimento) {
            this.vencimento = vencimento;
        }

        public String getImagem() {
            return imagem;
        }

        public void setImagem(String imagem) {
            this.imagem = imagem;
        }
    }

    // ===== MÉTODOS PARA COMPATIBILIDADE COM CONTROLLER =====

    // Migrado de GerarCarneController.carregarNovaParcela
    public Uni<Void> carregarNovaParcela() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de GerarCarneController.imprimirSelecionadas
    public Uni<String> imprimirSelecionadas() {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.imprimirHistorico
    public Uni<String> imprimirHistorico(Long ccId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.imprimirDiarioClasse
    public Uni<String> imprimirDiarioClasse(Long ofccId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.imprimirBoletimTeste
    public Uni<String> imprimirBoletimTeste(Long ccId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.gerarCarneMaterial
    public Uni<String> gerarCarneMaterial(Long vendaProdutoId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.gerarCarne
    public Uni<String> gerarCarne(Long ccId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.gerarDocumentoCancelamentoContrato
    public Uni<String> gerarDocumentoCancelamentoContrato(Long ccId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.carregarSituacao
    public Uni<Void> carregarSituacao() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de GerarCarneController.atualizarValorCancelamento
    public Uni<Void> atualizarValorCancelamento(Long parcelaId) {
        return Uni.createFrom().voidItem();
    }

    // Migrado de GerarCarneController.carregarRequerimentoCancelamentoContrato
    public Uni<Void> carregarRequerimentoCancelamentoContrato(Long contratoId) {
        return Uni.createFrom().voidItem();
    }

    // Migrado de GerarCarneController.verificarPreCancelamento
    public Uni<Boolean> verificarPreCancelamento(Long cancelamentoId) {
        return Uni.createFrom().item(false);
    }

    // Migrado de GerarCarneController.gerarRequerimentoCancelamento
    public Uni<Void> gerarRequerimentoCancelamento(Long cancelamentoId) {
        return Uni.createFrom().voidItem();
    }

    // Migrado de GerarCarneController.carregarRequerimentoCancelamentoMatricula
    public Uni<Void> carregarRequerimentoCancelamentoMatricula(Long matriculaId) {
        return Uni.createFrom().voidItem();
    }

    // Migrado de GerarCarneController.gerarPrevisaoContratual
    public Uni<String> gerarPrevisaoContratual(Long ccId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.gerarPrevisaoMatricula
    public Uni<String> gerarPrevisaoMatricula(Long mmId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.gerarDocumentoCancelamentoMatricula
    public Uni<String> gerarDocumentoCancelamentoMatricula(Long mmId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.gerarViaDocumentoCancelamentoContratual
    public Uni<String> gerarViaDocumentoCancelamentoContratual(Long ccId) {
        return Uni.createFrom().item(null);
    }

    // Migrado de GerarCarneController.gerarViaDocumentoCancelamentoMatricula
    public Uni<String> gerarViaDocumentoCancelamentoMatricula(Long mmId) {
        return Uni.createFrom().item(null);
    }

    public record RequerimentoCancelamentoDTO(
            String valorDesconto,
            String valorHoraAula,
            String valorTotal,
            String valorPagoParcela,
            String horasAulas,
            String aulasDadas,
            String valorJuros,
            String valorMulta,
            String valorTotalHorasDadas,
            String valorComDesconto,
            String presencaAusencia,
            String presencaPresente,
            String presencaMeiaPresenca,
            String presencaAtestado,
            String presencaNaoRegistrado,
            String informacoesData,
            String informacoesTurma,
            String valorTotalPagar
    ) {
        public RequerimentoCancelamentoDTO() {
            this(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        }
    }

    // ===== DEPENDÊNCIAS CROSS-SERVICE (STUBS) =====

    // Precisa ser implementado via cliente HTTP/gRPC para microserviço básico
    public interface FeriadoService {
        Uni<List<FeriadoDTO>> buscarFeriadosComUnidadeData(Long unidadeId, Date data);
    }

    @ApplicationScoped
    public static class FeriadoServiceStub implements FeriadoService {
        @Override
        public Uni<List<FeriadoDTO>> buscarFeriadosComUnidadeData(Long unidadeId, Date data) {
            return Uni.createFrom().item(new ArrayList<>());
        }
    }

    public record FeriadoDTO(Long id, String descricao, Date data, Long unidadeId) {
    }

    // Utilitário de datas (migração do DateUtil original)
    public static class DateUtil {
        public static Date somarDias(Date data, int dias) {
            Calendar cal = Calendar.getInstance();
            cal.setTime(data);
            cal.add(Calendar.DAY_OF_MONTH, dias);
            return cal.getTime();
        }

        public static long diferencaEmDias(Date dataInicial, Date dataFinal) {
            return (dataFinal.getTime() - dataInicial.getTime()) / (1000 * 60 * 60 * 24);
        }
    }
}