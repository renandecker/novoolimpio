package br.com.sol7.olimpio.estoque.produto;

import java.math.BigDecimal;
import java.util.Date;

public record ProdutoResponse(Long id, BigDecimal valor, String imagem, int quantidade, String nome, String tamanho, boolean ativo, Date dataCadastro, Long categoriaId, Long marcaId) {}
