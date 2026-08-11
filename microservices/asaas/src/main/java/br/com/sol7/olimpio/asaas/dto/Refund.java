package br.com.sol7.olimpio.asaas.dto;

import java.math.BigDecimal;
import java.util.Date;

public class Refund {

    private Date dateCreated;

    private String status;

    private BigDecimal value;

    private String description;

    private String transactionReceiptUrl;

    public Date getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(Date dateCreated) {
        this.dateCreated = dateCreated;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTransactionReceiptUrl() {
        return transactionReceiptUrl;
    }

    public void setTransactionReceiptUrl(String transactionReceiptUrl) {
        this.transactionReceiptUrl = transactionReceiptUrl;
    }
}

