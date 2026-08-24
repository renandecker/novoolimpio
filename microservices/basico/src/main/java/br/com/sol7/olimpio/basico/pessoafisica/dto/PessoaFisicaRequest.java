package br.com.sol7.olimpio.basico.pessoafisica.dto;

import java.time.LocalDate;

public record PessoaFisicaRequest(Long pessoaId,String nomeSocial,String nome,String cpf,String rg,String nomeReferencia,String telefoneReferencia,String celularReferencia,String nomeReferencia2,String telefoneReferencia2,String celularReferencia2,LocalDate dataEmissaoRg,String orgaoEmissorRg,Long cidadeOrigemId,String nomePai,String nomeMae,LocalDate dataNascimento,Long generoId,Long etniaId,Long escolaridadeId,Long estadoCivilId,String facebook,String twitter,String googlePlus,String telefoneComercial){}
