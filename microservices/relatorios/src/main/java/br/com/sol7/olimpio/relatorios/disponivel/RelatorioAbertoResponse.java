package br.com.sol7.olimpio.relatorios.disponivel;

/**
 * Configuração do relatório autorizado para a tela de visualização.
 */
public record RelatorioAbertoResponse(Long id,String nome,String tipo,Object configuracao,Object dados){}
