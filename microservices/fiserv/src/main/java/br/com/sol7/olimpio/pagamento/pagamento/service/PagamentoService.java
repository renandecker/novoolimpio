package br.com.sol7.olimpio.pagamento.pagamento.service;

import br.com.sol7.olimpio.pagamento.parcelacartao.entity.ParcelaCartao;
import br.com.sol7.olimpio.pagamento.parcelacartao.service.ParcelaCartaoService;
import br.com.sol7.olimpio.pagamento.pagamento.dto.EfetuarPagamentoRequest;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;

/**
 * Porta unica de pagamento: recebe a forma escolhida (CARTAO_VISTA / CARTAO_PARCELADO) e
 * delega para o modulo parcelacartao, que faz o vinculo com fin_parcela (id_parcela_cartao).
 * <p>
 * O fluxo PIX foi movido para o asaas-service (rota /api/asaas/pix, antes /api/pagamento/pix).
 */
@ApplicationScoped
public class PagamentoService {

    public static final String CARTAO_VISTA = "CARTAO_VISTA";
    public static final String CARTAO_PARCELADO = "CARTAO_PARCELADO";

    @Inject
    ParcelaCartaoService parcelaCartaoService;

    public Uni<Object> efetuar(EfetuarPagamentoRequest r) {
        return switch (r.formaPagamento().toUpperCase()) {
            case CARTAO_VISTA -> parcelaCartaoService.pagar(r.paraRequestCartao(ParcelaCartao.TIPO_VISTA))
                    .map(item -> (Object) item)
                ;
            case CARTAO_PARCELADO -> parcelaCartaoService.pagar(r.paraRequestCartao(ParcelaCartao.TIPO_PARCELADO))
                    .map(item -> (Object) item)
                ;
            default ->Uni.<Object>createFrom().failure(
                    new BadRequestException("formaPagamento deve ser CARTAO_VISTA ou CARTAO_PARCELADO"));
        } ;
    }
}
