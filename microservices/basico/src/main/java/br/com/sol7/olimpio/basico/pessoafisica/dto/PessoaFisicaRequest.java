package br.com.sol7.olimpio.basico.pessoafisica.dto;

import java.util.Date;

public record PessoaFisicaRequest(Long pessoaId,String nomeSocial,String nome,String cpf,String rg,String nomeReferencia,String telefoneReferencia,String celularReferencia,String nomeReferencia2,String telefoneReferencia2,String celularReferencia2,Date dataEmissaoRg,String orgaoEmissorRg,Long cidadeOrigemId,String nomePai,String nomeMae,Date dataNascimento,Long generoId,Long etniaId,Long escolaridadeId,Long estadoCivilId,String facebook,String twitter,String googlePlus,String telefoneComercial){}
