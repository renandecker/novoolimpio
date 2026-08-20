package br.com.sol7.olimpio.estoque.pendenciavendaproduto;

import java.math.BigDecimal;
import java.util.Date;

public record PendenciaVendaProdutoResponse(
        Long id,int quantidade,Long vendaProdutoId,Long produtoId,Date dataEntrega,
        String produtoNome,String produtoImagem,String produtoCategoriaDescricao,
        Date vendaDataCompra,BigDecimal vendaValor
        ){
public PendenciaVendaProdutoResponse(Long id,int quantidade,Long vendaProdutoId,Long produtoId,Date dataEntrega){
        this(id,quantidade,vendaProdutoId,produtoId,dataEntrega,null,null,null,null,null);
        }
        }
