package br.com.sol7.olimpio.pagamento.pix.service;

import br.com.sol7.olimpio.pagamento.parcela.entity.Parcela;
import br.com.sol7.olimpio.pagamento.parcela.repository.ParcelaRepository;
import br.com.sol7.olimpio.pagamento.pix.dto.GerarCobrancaPixRequest;
import br.com.sol7.olimpio.pagamento.pix.dto.ParcelaPixResponse;
import br.com.sol7.olimpio.pagamento.pix.entity.ParcelaPix;
import br.com.sol7.olimpio.pagamento.pix.provider.PixProviderClient;
import br.com.sol7.olimpio.pagamento.pix.repository.ParcelaPixRepository;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

/**
 * Gera e consulta cobrancas PIX, reaproveitando fin_parcela_pix (tabela legada) e vinculando o
 * resultado a fin_parcela.id_parcela_pix - exatamente como o modulo parcelacartao faz para
 * fin_parcela_cartao. A geracao efetiva do QR Code/chave e delegada a PixProviderClient (ver
 * README: a collection Fiserv fornecida nao possui um endpoint nativo de PIX).
 */
@ApplicationScoped
public class PixService {

    @Inject ParcelaPixRepository parcelaPixRepository;
    @Inject ParcelaRepository parcelaRepository;
    @Inject PixProviderClient provider;

    @WithTransaction
    public Uni<ParcelaPixResponse> gerarCobranca(GerarCobrancaPixRequest r) {
        return parcelaRepository.findById(r.idParcela())
                .onItem().ifNull().failWith(() -> new NotFoundException("Parcela nao encontrada"))
                .onItem().transformToUni(parcela -> {
                    var charge = provider.criarCobranca(String.valueOf(r.idPessoa()), "Parcela " + r.idParcela(),
                            r.valor(), r.dataVencimento());

                    var pix = new ParcelaPix();
                    pix.qrcode = charge.qrcode();
                    pix.chave = charge.chave();
                    pix.situacao = charge.situacao();
                    pix.dataVencimento = r.dataVencimento();
                    pix.valor = r.valor();
                    pix.providerChargeId = charge.chargeId();
                    pix.dataCriacao = java.time.LocalDateTime.now();
                    pix.ativo = true;

                    return parcelaPixRepository.persist(pix)
                            .onItem().transformToUni(persisted -> {
                                parcela.idParcelaPix = pix.id;
                                parcela.formaPagamento = "PIX";
                                return parcelaRepository.persist(parcela).map(v -> toResponse(pix));
                            });
                });
    }

    @WithSession
    public Uni<ParcelaPixResponse> consultar(Long id) {
        return parcelaPixRepository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Cobranca PIX nao encontrada"))
                .map(this::toResponse);
    }

    /** Consulta o status atual junto ao provider (PSP) e atualiza situacao/valorPago/endToEndId localmente. */
    @WithTransaction
    public Uni<ParcelaPixResponse> atualizarStatus(Long id) {
        return parcelaPixRepository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Cobranca PIX nao encontrada"))
                .invoke(pix -> {
                    var status = provider.consultarStatus(pix.providerChargeId != null ? pix.providerChargeId : String.valueOf(pix.id));
                    pix.situacao = status.situacao();
                    if (status.valorPago() != null) {
                        pix.valorPago = status.valorPago();
                    }
                    if (status.endToEndId() != null) {
                        pix.endToEndId = status.endToEndId();
                        pix.dataPagamento = java.time.LocalDateTime.now();
                    }
                })
                .map(this::toResponse);
    }

    private ParcelaPixResponse toResponse(ParcelaPix p) {
        return new ParcelaPixResponse(p.id, p.qrcode, p.chave, p.situacao, p.valor, p.valorPago,
                p.providerChargeId, p.endToEndId, p.dataVencimento, p.dataCriacao, p.dataPagamento);
    }
}
