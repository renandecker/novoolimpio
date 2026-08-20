package br.com.sol7.olimpio.login.tema.dto;

public record TemaResponse(
        Long id,
        String tema,
        String titulo,
        Long idLayout,
        String folderCss,
        String corPrimaria,
        String corSecundaria,
        String corBarra,
        String corFundo,
        String corTexto,
        String corBorda,
        String corDestaque,
        String corEmail,
        String posicaoLogo,
        String loginPosicao,
        Boolean temaPadrao,
        Boolean ativo
        ){}
