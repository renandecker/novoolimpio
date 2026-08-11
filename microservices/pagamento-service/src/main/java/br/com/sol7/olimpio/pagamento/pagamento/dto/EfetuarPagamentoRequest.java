package br.com.sol7.olimpio.pagamento.pagamento.dto;

import br.com.sol7.olimpio.pagamento.parcelacartao.dto.PagamentoCartaoRequest;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Porta de entrada unica para pagar uma parcela (fin_parcela): PIX, cartao a vista ou cartao
 * parcelado. Preencha apenas os campos relativos a forma escolhida (formaPagamento).
 */
public record EfetuarPagamentoRequest(
        @NotNull Long idParcela,
        @NotNull Long idPessoa,
        @NotNull String formaPagamento, // PIX | CARTAO_VISTA | CARTAO_PARCELADO
        @NotNull BigDecimal valor,

        // PIX
        LocalDate dataVencimentoPix,

        // Cartao (vista ou parcelado)
        Long idCartaoPessoa,
        String numeroCartao,
        String cvvCartao,
        String validadeMes,
        String validadeAno,
        int qtdParcelas) {

    public PagamentoCartaoRequest paraRequestCartao(String tipoPagamento) {
        return new PagamentoCartaoRequest(idParcela, idPessoa, idCartaoPessoa, numeroCartao, cvvCartao,
                validadeMes, validadeAno, tipoPagamento, qtdParcelas, valor);
    }
}
