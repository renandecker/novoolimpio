package br.com.sol7.olimpio.basico.logradouro.dto;

import br.com.sol7.olimpio.basico.bairro.dto.BairroResponse;
import br.com.sol7.olimpio.basico.cidade.dto.CidadeResponse;

public record BuscarEnderecoResponse(LogradouroResponse logradouro, BairroResponse bairro, CidadeResponse cidade) {}