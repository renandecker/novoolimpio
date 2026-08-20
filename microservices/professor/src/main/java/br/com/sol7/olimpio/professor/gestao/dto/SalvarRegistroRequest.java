package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record SalvarRegistroRequest(List<RegistroSalvarDto> registros){

public record RegistroSalvarDto(Long id,Long ocorrenciaId,String descricao){
        }
        }
