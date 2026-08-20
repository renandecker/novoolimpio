package br.com.sol7.olimpio.login.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(@NotBlank String username){}
