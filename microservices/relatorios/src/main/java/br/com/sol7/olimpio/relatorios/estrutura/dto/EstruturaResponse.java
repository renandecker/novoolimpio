package br.com.sol7.olimpio.relatorios.estrutura;
import java.util.Date;

public record EstruturaResponse(Long id, String tabela, String condicao, String nome, String zoom, Long configuracaoEmailId, Date dataAtualizacao, String coordenada, String nomeBanco) {}
