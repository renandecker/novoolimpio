package br.com.sol7.olimpio.asaas.dto;

import br.com.sol7.olimpio.asaas.enumm.AsaasStatusParcela;
import br.com.sol7.olimpio.asaas.enumm.AsaasTipoPagamento;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public class ResponseCriarPagamento {
    private String object;
    private String id;
    private Date dateCreated;
    private String customer;
    private String paymentLink;
    private Date dueDate;
    private Date creditDate;
    private BigDecimal value;
    private BigDecimal netValue;
    private AsaasTipoPagamento billingType;
    private Boolean canBePaidAfterDueDate;
    private String pixTransaction;
    private AsaasStatusParcela status;
    private String description;
    private String externalReference;
    private String installment;
    private BigDecimal originalValue;
    private BigDecimal interestValue;
    private Date originalDueDate;
    private Date paymentDate;
    private Date clientPaymentDate;
    private Integer installmentNumber;
    private String transactionReceiptUrl;
    private String nossoNumero;
    private String invoiceUrl;
    private String bankSlipUrl;
    private BigDecimal invoiceNumber;
    private Discount discount;
    private Value fine;
    private Value interest;
    private Boolean deleted;
    private Boolean postalService;
    private Boolean anticipated;
    private Boolean anticipable;
    private List<Refund> refunds;

    private List<Error> errors;

    public String getObject() {
        return object;
    }

    public void setObject(String object) {
        this.object = object;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Date getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(Date dateCreated) {
        this.dateCreated = dateCreated;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getPaymentLink() {
        return paymentLink;
    }

    public void setPaymentLink(String paymentLink) {
        this.paymentLink = paymentLink;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public BigDecimal getNetValue() {
        return netValue;
    }

    public void setNetValue(BigDecimal netValue) {
        this.netValue = netValue;
    }

    public AsaasTipoPagamento getBillingType() {
        return billingType;
    }

    public void setBillingType(AsaasTipoPagamento billingType) {
        this.billingType = billingType;
    }

    public Boolean getCanBePaidAfterDueDate() {
        return canBePaidAfterDueDate;
    }

    public void setCanBePaidAfterDueDate(Boolean canBePaidAfterDueDate) {
        this.canBePaidAfterDueDate = canBePaidAfterDueDate;
    }

    public String getPixTransaction() {
        return pixTransaction;
    }

    public void setPixTransaction(String pixTransaction) {
        this.pixTransaction = pixTransaction;
    }

    public AsaasStatusParcela getStatus() {
        return status;
    }

    public void setStatus(AsaasStatusParcela status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExternalReference() {
        return externalReference;
    }

    public void setExternalReference(String externalReference) {
        this.externalReference = externalReference;
    }

    public BigDecimal getOriginalValue() {
        return originalValue;
    }

    public void setOriginalValue(BigDecimal originalValue) {
        this.originalValue = originalValue;
    }

    public BigDecimal getInterestValue() {
        return interestValue;
    }

    public void setInterestValue(BigDecimal interestValue) {
        this.interestValue = interestValue;
    }

    public Date getOriginalDueDate() {
        return originalDueDate;
    }

    public void setOriginalDueDate(Date originalDueDate) {
        this.originalDueDate = originalDueDate;
    }

    public Date getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Date paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Date getClientPaymentDate() {
        return clientPaymentDate;
    }

    public void setClientPaymentDate(Date clientPaymentDate) {
        this.clientPaymentDate = clientPaymentDate;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public String getTransactionReceiptUrl() {
        return transactionReceiptUrl;
    }

    public void setTransactionReceiptUrl(String transactionReceiptUrl) {
        this.transactionReceiptUrl = transactionReceiptUrl;
    }

    public String getNossoNumero() {
        return nossoNumero;
    }

    public void setNossoNumero(String nossoNumero) {
        this.nossoNumero = nossoNumero;
    }

    public String getInvoiceUrl() {
        return invoiceUrl;
    }

    public void setInvoiceUrl(String invoiceUrl) {
        this.invoiceUrl = invoiceUrl;
    }

    public String getBankSlipUrl() {
        return bankSlipUrl;
    }

    public void setBankSlipUrl(String bankSlipUrl) {
        this.bankSlipUrl = bankSlipUrl;
    }

    public BigDecimal getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(BigDecimal invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Discount getDiscount() {
        return discount;
    }

    public void setDiscount(Discount discount) {
        this.discount = discount;
    }

    public Value getFine() {
        return fine;
    }

    public void setFine(Value fine) {
        this.fine = fine;
    }

    public Value getInterest() {
        return interest;
    }

    public void setInterest(Value interest) {
        this.interest = interest;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public Boolean getPostalService() {
        return postalService;
    }

    public void setPostalService(Boolean postalService) {
        this.postalService = postalService;
    }

    public Boolean getAnticipated() {
        return anticipated;
    }

    public void setAnticipated(Boolean anticipated) {
        this.anticipated = anticipated;
    }

    public Boolean getAnticipable() {
        return anticipable;
    }

    public void setAnticipable(Boolean anticipable) {
        this.anticipable = anticipable;
    }

    public List<Refund> getRefunds() {
        return refunds;
    }

    public void setRefunds(List<Refund> refunds) {
        this.refunds = refunds;
    }

    public String getInstallment() {
        return installment;
    }

    public void setInstallment(String installment) {
        this.installment = installment;
    }

    public List<Error> getErrors() {
        return errors;
    }

    public void setErrors(List<Error> errors) {
        this.errors = errors;
    }
}

