package br.com.sol7.olimpio.asaas.parcela;

import br.com.sol7.olimpio.asaas.dto.WebHook;
import br.com.sol7.olimpio.asaas.dto.WebHookPayment;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class FinAsaasParcelaService {

    @Inject
    FinAsaasParcelaRepository repository;

    public Uni<List<FinAsaasParcelaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FinAsaasParcelaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<FinAsaasParcelaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FinAsaasParcela not found"))
                .map(this::toResponse);
    }

    public Uni<FinAsaasParcelaResponse> findByAsaasId(String asaasId) {
        return repository.findByAsaasId(asaasId).onItem().ifNull()
                .failWith(() -> new NotFoundException("FinAsaasParcela not found for asaasId " + asaasId))
                .map(this::toResponse);
    }

    public Uni<FinAsaasParcelaResponse> create(FinAsaasParcelaRequest r) {
        var e = new FinAsaasParcela();
        apply(e, r);
        if (e.flAtivo == null) e.flAtivo = true;
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FinAsaasParcelaResponse> update(Long id, FinAsaasParcelaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FinAsaasParcela not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("FinAsaasParcela not found")));
    }

    /**
     * Processa um webhook do Asaas (evento PAYMENT_*) e espelha a cobrança na tabela
     * local (fin_asaas_parcela). Insere quando nao existe (PAYMENT_CREATED) ou
     * atualiza o registro existente pelo id do Asaas nos demais eventos.
     */
    public Uni<FinAsaasParcelaResponse> processarWebhook(WebHook webhook) {
        if (webhook == null || webhook.getPayment() == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("webhook sem payment"));
        }
        WebHookPayment payment = webhook.getPayment();
        return repository.findByAsaasId(payment.getId()).onItem().transformToUni(existing -> {
            FinAsaasParcela e = existing != null ? existing : new FinAsaasParcela();
            if (existing == null) {
                e.flAtivo = true;
            }
            applyPayment(e, payment);
            return repository.persist(e).replaceWith(() -> toResponse(e));
        });
    }

    private void applyPayment(FinAsaasParcela e, WebHookPayment p) {
        e.billingType = p.getBillingType() != null ? p.getBillingType().name() : null;
        e.paymentDate = p.getPaymentDate() != null ? p.getPaymentDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate() : null;
        e.value = p.getValue() != null ? p.getValue().doubleValue() : null;
        e.installment = p.getInstallment();
        e.asaasId = p.getId();
        e.status = p.getStatus() != null ? p.getStatus().name() : null;
        e.url = p.getBankSlipUrl();
        e.urlPagamento = p.getInvoiceUrl();
        e.description = p.getDescription();
        e.installmentNumber = p.getInstallmentNumber() != null ? p.getInstallmentNumber().intValue() : null;
        e.discount = p.getDiscount() != null && p.getDiscount().getValue() != null ? p.getDiscount().getValue().doubleValue() : null;
        e.discountType = p.getDiscount() != null ? p.getDiscount().getType() : null;
        e.fine = p.getFine() != null && p.getFine().getValue() != null ? p.getFine().getValue().doubleValue() : null;
        e.fineType = p.getFine() != null ? p.getFine().getType() : null;
        e.interest = p.getInterest() != null && p.getInterest().getValue() != null ? p.getInterest().getValue().doubleValue() : null;
        e.interestType = p.getInterest() != null ? p.getInterest().getType() : null;
    }

    private void apply(FinAsaasParcela e, FinAsaasParcelaRequest r) {
        e.billingType = r.billingType();
        e.dataCriacao = r.dataCriacao();
        e.paymentDate = r.paymentDate();
        e.value = r.value();
        e.installment = r.installment();
        e.asaasId = r.asaasId();
        e.status = r.status();
        e.url = r.url();
        e.urlPagamento = r.urlPagamento();
        e.description = r.description();
        e.installmentNumber = r.installmentNumber();
        e.discount = r.discount();
        e.fine = r.fine();
        e.interest = r.interest();
        e.discountType = r.discountType();
        e.fineType = r.fineType();
        e.interestType = r.interestType();
        e.qrCodeImage = r.qrCodeImage();
        e.keyPix = r.keyPix();
        e.flAtivo = r.flAtivo() == null ? true : r.flAtivo();
        e.payload = r.payload();
    }

    private FinAsaasParcelaResponse toResponse(FinAsaasParcela e) {
        return new FinAsaasParcelaResponse(
                e.id, e.billingType, e.dataCriacao, e.paymentDate, e.value, e.installment,
                e.asaasId, e.status, e.url, e.urlPagamento, e.description, e.installmentNumber,
                e.discount, e.fine, e.interest, e.discountType, e.fineType, e.interestType,
                e.qrCodeImage, e.keyPix, e.flAtivo, e.payload);
    }
}
