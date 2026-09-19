package br.com.sol7.olimpio.comercial.arquivoprocon;

public record ArquivoProconChunkRequest(String uploadId, String fileName, int chunkIndex, int totalChunks, String fileData) {}
