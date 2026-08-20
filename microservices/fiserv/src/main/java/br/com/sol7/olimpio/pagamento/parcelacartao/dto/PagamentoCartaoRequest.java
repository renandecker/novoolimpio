package br.com.sol7.olimpio.pagamento.parcelacartao.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

/**
 * Cobranca de cartao para uma parcela (fin_parcela). Informe idCartaoPessoa para usar um cartao
 * ja cadastrado (fin_cartao_pessoa - recomendado, cobra via paymentToken) OU os dados "crus" do
 * cartao (numero/cvv/validade) para uma cobranca avulsa sem cadastro previo.
 * <p>
 * tipoPagamento = VISTA (uma unica cobranca) ou PARCELADO (payment schedule na Fiserv).
 * Quando PARCELADO, "valor" deve ser o valor de CADA parcela e qtdParcelas a quantidade total.
 */
public record PagamentoCartaoRequest(
@NotNull Long idParcela,
@NotNull Long idPessoa,
        Long idCartaoPessoa,
        String numeroCartao,
        String cvvCartao,
@Pattern(regexp = "0[1-9]|1[0-2]", message = "mes invalido (MM)") String validadeMes,
@Pattern(regexp = "\\d{4}", message = "ano invalido (AAAA)") String validadeAno,
@NotNull String tipoPagamento,
        int qtdParcelas,
@NotNull @DecimalMin(value = "0.01") BigDecimal valor){

public boolean usaCartaoCadastrado(){
        return idCartaoPessoa!=null;
        }
        }
