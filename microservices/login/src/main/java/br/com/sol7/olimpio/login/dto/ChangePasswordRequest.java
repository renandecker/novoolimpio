package br.com.sol7.olimpio.login.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(@NotBlank String currentPassword,@NotBlank @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres") String newPassword){}
