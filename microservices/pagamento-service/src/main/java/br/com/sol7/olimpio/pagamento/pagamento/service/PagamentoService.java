package br.com.sol7.olimpio.pagamento.pagamento.service;

import br.com.sol7.olimpio.pagamento.parcelacartao.entity.ParcelaCartao;
import br.com.sol7.olimpio.pagamento.parcelacartao.service.ParcelaCartaoService;
import br.com.sol7.olimpio.pagamento.pagamento.dto.EfetuarPagamentoRequest;
import br.com.sol7.olimpio.pagamento.pix.dto.GerarCobrancaPixRequest;
import br.com.sol7.olimpio.pagamento.pix.service.PixService;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;

/**
 * Porta unica de pagamento: recebe a forma escolhida (PIX / CARTAO_VISTA / CARTAO_PARCELADO) e
 * delega para o modulo correspondente (pix ou parcelacartao), que fazem o vinculo com
 * fin_parcela (id_parcela_pix / id_parcela_cartao).
 */
@ApplicationScoped
public class PagamentoService {

    public static final String PIX = "PIX";
    public static final String CARTAO_VISTA = "CARTAO_VISTA";
    public static final String CARTAO_PARCELADO = "CARTAO_PARCELADO";

    @Inject PixService pixService;
    @Inject ParcelaCartaoService parcelaCartaoService;

    public Uni<Object> efetuar(EfetuarPagamentoRequest r) {
        return switch (r.formaPagamento().toUpperCase()) {
            case PIX -> pixService.gerarCobranca(new GerarCobrancaPixRequest(
                            r.idParcela(), r.idPessoa(), r.valor(),
                            r.dataVencimentoPix() != null ? r.dataVencimentoPix() : java.time.LocalDate.now().plusDays(1)))
                    .map(item -> (Object) item);
            case CARTAO_VISTA -> parcelaCartaoService.pagar(r.paraRequestCartao(ParcelaCartao.TIPO_VISTA))
                    .map(item -> (Object) item);
            case CARTAO_PARCELADO -> parcelaCartaoService.pagar(r.paraRequestCartao(ParcelaCartao.TIPO_PARCELADO))
                    .map(item -> (Object) item);
            default -> Uni.<Object>createFrom().failure(
                    new BadRequestException("formaPagamento deve ser PIX, CARTAO_VISTA ou CARTAO_PARCELADO"));
        };
    }
}
