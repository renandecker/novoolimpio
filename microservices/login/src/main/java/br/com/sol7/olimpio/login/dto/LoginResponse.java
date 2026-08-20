package br.com.sol7.olimpio.login.dto;

import java.util.Map;
import java.util.Set;

public record LoginResponse(String accessToken,long expiresAt,String username,Set<String> permissions,
        Map<String, Set<String>>modulePermissions,
        String nome,String email,String cpf,String foto,
        String defaultOutcome,String hierarquia){}
