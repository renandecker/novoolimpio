package br.com.sol7.olimpio.financeiro.etapascobranca;

public record EtapasCobrancaResponse(Long id, String descricao, Integer ordem, boolean customizado, int tipoModeloDocumento, String campoCustomizado, String localDocumento, String nomeDocumento, String campoDetalhes, boolean usuario, boolean perfil) {}
