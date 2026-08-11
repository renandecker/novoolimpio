package br.com.sol7.olimpio.basico.pessoadocumento.dto;
import java.util.Date;

public record PessoaDocumentoRequest(String nome, String documento, Date dataAtualizacao, Long pessoaId) {}
