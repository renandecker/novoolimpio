package br.com.sol7.olimpio.pagamento.cartaopessoa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CadastrarCartaoRequest(
@NotNull Long idPessoa,
@NotBlank String cpf,
@NotBlank String numero,
@NotBlank String cvv,
@Pattern(regexp = "0[1-9]|1[0-2]", message = "mes invalido (MM)") String validadeMes,
@Pattern(regexp = "\\d{4}", message = "ano invalido (AAAA)") String validadeAno,
@NotBlank String nomeTitular,
        String apelido,
        boolean principal){}
