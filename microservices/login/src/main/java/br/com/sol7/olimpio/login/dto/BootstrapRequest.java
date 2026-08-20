package br.com.sol7.olimpio.login.dto;

import jakarta.validation.constraints.NotBlank;

public record BootstrapRequest(@NotBlank String username,@NotBlank String password){}