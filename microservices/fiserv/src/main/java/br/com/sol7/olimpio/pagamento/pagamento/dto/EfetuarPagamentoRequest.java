package br.com.sol7.olimpio.pagamento.pagamento.dto;

import br.com.sol7.olimpio.pagamento.parcelacartao.dto.PagamentoCartaoRequest;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Porta de entrada unica para pagar uma parcela (fin_parcela): cartao a vista ou cartao
 * parcelado. Preencha apenas os campos relativos a forma escolhida (formaPagamento).
 * <p>
 * O fluxo PIX foi movido para o asaas-service (rota /api/asaas/pix).
 */
public record EfetuarPagamentoRequest(
@NotNull Long idParcela,
@NotNull Long idPessoa,
@NotNull String formaPagamento, // CARTAO_VISTA | CARTAO_PARCELADO
@NotNull BigDecimal valor,

        // Cartao (vista ou parcelado)
        Long idCartaoPessoa,
        String numeroCartao,
        String cvvCartao,
        String validadeMes,
        String validadeAno,
        int qtdParcelas){

public PagamentoCartaoRequest paraRequestCartao(String tipoPagamento){
        return new PagamentoCartaoRequest(idParcela,idPessoa,idCartaoPessoa,numeroCartao,cvvCartao,
        validadeMes,validadeAno,tipoPagamento,qtdParcelas,valor);
        }
        }
