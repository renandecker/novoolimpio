package br.com.sol7.olimpio.asaas.dto;

public class QrCode {

    private String payload;

    private String encodedImage;

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getEncodedImage() {
        return encodedImage;
    }

    public void setEncodedImage(String encodedImage) {
        this.encodedImage = encodedImage;
    }
}

