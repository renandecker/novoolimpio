package br.com.sol7.olimpio.pagamento.cartaopessoa.dto;

import java.time.LocalDateTime;

public record CartaoPessoaResponse(
        Long id,
        Long idPessoa,
        String cpf,
        String bin,
        String ultimosDigitos,
        String bandeira,
        String nomeTitular,
        String validadeMes,
        String validadeAno,
        String apelido,
        boolean ativo,
        boolean principal,
        LocalDateTime dataCadastro) {}
