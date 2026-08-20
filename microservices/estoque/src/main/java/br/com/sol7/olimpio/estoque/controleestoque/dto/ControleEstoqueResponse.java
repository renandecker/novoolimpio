package br.com.sol7.olimpio.estoque.controleestoque;

import java.math.BigDecimal;

public record ControleEstoqueResponse(
        Long id,
        BigDecimal valor,
        int quantidade,
        int qtdeSolicitado,
        int qtdeDefeito,
        int qtdeFalta,
        int qtdeNaoEncontrado,
        int qtdeReservado,
        int qtdeAprovadoNaoEntregue,
        Long produtoId,
        Long unidadeId,
        String produtoNome,
        String produtoImagem,
        BigDecimal produtoValor,
        int produtoQuantidade,
        String produtoCategoriaDescricao,
        String unidadeNome,
        String usuarioLogin
        ){
public ControleEstoqueResponse(Long id,BigDecimal valor,int quantidade,int qtdeSolicitado,int qtdeDefeito,int qtdeFalta,int qtdeNaoEncontrado,int qtdeReservado,int qtdeAprovadoNaoEntregue,Long produtoId,Long unidadeId){
        this(id,valor,quantidade,qtdeSolicitado,qtdeDefeito,qtdeFalta,qtdeNaoEncontrado,qtdeReservado,qtdeAprovadoNaoEntregue,produtoId,unidadeId,null,null,null,0,null,null,null);
        }
        }
