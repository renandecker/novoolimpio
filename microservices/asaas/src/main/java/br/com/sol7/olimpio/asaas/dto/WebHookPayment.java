package br.com.sol7.olimpio.asaas.dto;

import br.com.sol7.olimpio.asaas.enumm.AsaasStatusParcela;
import br.com.sol7.olimpio.asaas.enumm.AsaasTipoPagamento;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public class WebHookPayment {
    private String object;
    private String id;
    private String nossoNumero;
    private Date dateCreated;
    private String customer;
    private String subscription;
    private String installment;
    private String paymentLink;
    private String custody;
    private Date dueDate;
    private Date confirmedDate;
    private Date creditDate;
    private Date estimatedCreditDate;
    private BigDecimal value;
    private BigDecimal netValue;
    private AsaasTipoPagamento billingType;
    private Boolean canBePaidAfterDueDate;
    private Date lastInvoiceViewedDate;
    private Date lastBankSlipViewedDate;
    private String pixTransaction;
    private AsaasStatusParcela status;
    private String description;
    private String externalReference;
    private BigDecimal originalValue;
    private BigDecimal interestValue;
    private Date originalDueDate;
    private Date paymentDate;
    private Date clientPaymentDate;
    private BigDecimal installmentNumber;
    private String transactionReceiptUrl;
    private String invoiceUrl;
    private String bankSlipUrl;
    private BigDecimal invoiceNumber;
    private Boolean deleted;
    private Boolean postalService;
    private Boolean anticipated;
    private Boolean anticipable;

    private WebHookCreditCard creditCard;
    private WebHookDiscount discount;
    private WebHookFineInterest fine;
    private WebHookFineInterest interest;
    private List<WebHookSplit> split;
    private WebHookChargeback chargeback;
    private List<Refund> refunds;

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

    public String getNossoNumero() {
        return nossoNumero;
    }

    public void setNossoNumero(String nossoNumero) {
        this.nossoNumero = nossoNumero;
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

    public String getSubscription() {
        return subscription;
    }

    public void setSubscription(String subscription) {
        this.subscription = subscription;
    }

    public String getInstallment() {
        return installment;
    }

    public void setInstallment(String installment) {
        this.installment = installment;
    }

    public String getPaymentLink() {
        return paymentLink;
    }

    public void setPaymentLink(String paymentLink) {
        this.paymentLink = paymentLink;
    }

    public String getCustody() {
        return custody;
    }

    public void setCustody(String custody) {
        this.custody = custody;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public Date getConfirmedDate() {
        return confirmedDate;
    }

    public void setConfirmedDate(Date confirmedDate) {
        this.confirmedDate = confirmedDate;
    }

    public Date getCreditDate() {
        return creditDate;
    }

    public void setCreditDate(Date creditDate) {
        this.creditDate = creditDate;
    }

    public Date getEstimatedCreditDate() {
        return estimatedCreditDate;
    }

    public void setEstimatedCreditDate(Date estimatedCreditDate) {
        this.estimatedCreditDate = estimatedCreditDate;
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

    public Date getLastInvoiceViewedDate() {
        return lastInvoiceViewedDate;
    }

    public void setLastInvoiceViewedDate(Date lastInvoiceViewedDate) {
        this.lastInvoiceViewedDate = lastInvoiceViewedDate;
    }

    public Date getLastBankSlipViewedDate() {
        return lastBankSlipViewedDate;
    }

    public void setLastBankSlipViewedDate(Date lastBankSlipViewedDate) {
        this.lastBankSlipViewedDate = lastBankSlipViewedDate;
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

    public BigDecimal getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(BigDecimal installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public String getTransactionReceiptUrl() {
        return transactionReceiptUrl;
    }

    public void setTransactionReceiptUrl(String transactionReceiptUrl) {
        this.transactionReceiptUrl = transactionReceiptUrl;
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

    public WebHookCreditCard getCreditCard() {
        return creditCard;
    }

    public void setCreditCard(WebHookCreditCard creditCard) {
        this.creditCard = creditCard;
    }

    public WebHookDiscount getDiscount() {
        return discount;
    }

    public void setDiscount(WebHookDiscount discount) {
        this.discount = discount;
    }

    public WebHookFineInterest getFine() {
        return fine;
    }

    public void setFine(WebHookFineInterest fine) {
        this.fine = fine;
    }

    public WebHookFineInterest getInterest() {
        return interest;
    }

    public void setInterest(WebHookFineInterest interest) {
        this.interest = interest;
    }

    public List<WebHookSplit> getSplit() {
        return split;
    }

    public void setSplit(List<WebHookSplit> split) {
        this.split = split;
    }

    public WebHookChargeback getChargeback() {
        return chargeback;
    }

    public void setChargeback(WebHookChargeback chargeback) {
        this.chargeback = chargeback;
    }

    public List<Refund> getRefunds() {
        return refunds;
    }

    public void setRefunds(List<Refund> refunds) {
        this.refunds = refunds;
    }
}

