---
title: "Outgoing payment troubleshooting"
kind: Troubleshooting guide
summary: >-
  A troubleshooting article that maps payment API error codes to their causes and step-by-step fixes, grouped by
  issue type so developers find their answer fast.
# What a hiring manager should notice. Shown at the top of the sample page.
highlights:
  - Errors grouped by cause, so readers can scan straight to their problem
  - Quick-fix tables linked to detailed, step-by-step resolutions
  - Each step names the exact endpoint to call and what to check in the response
  - Clear escalation path with the details Support needs
note: Anonymized sample. Product names, endpoints, and data are illustrative.
order: 2
---

This article helps you troubleshoot API errors that might appear when you initiate an outgoing payment with the `POST /payments` endpoint.

The most common issues include:

* [Formatting issues](#formatting-issues)
* [Validation issues](#validation-issues):
  * [Counterparty account issues](#counterparty-account-issues)
  * [Payer account issues](#payer-account-issues)
* [Permission issues](#permission-issues)
* [Technical issues](#technical-issues)

When a payment request fails, the response contains an error code and a short message. For example:

```json
{
  "errors": [
    {
      "code": "AMOUNT_MISSING",
      "message": "Payment amount is not set."
    }
  ]
}
```

Find the error code in the sections below to see the cause and the solution.

## Formatting issues

When initiating a new payment, ensure all required fields are filled in correctly. Remember that each payment type, such as SEPA, SWIFT, or internal transfer, requires different input parameters.

If some of the required parameters are missing, you might encounter the following errors:

| Error code | Solution |
| :---- | :---- |
| `CURRENCY_CODE_MISSING` | Ensure that the payment currency code is entered in the ISO 4217 format, for example, `EUR`. |
| `AMOUNT_MISSING` | Enter the payment amount. |
| `DESCRIPTION_OR_REFERENCE_MISSING` | Provide the payment description or reference number. **Note:** SEPA and SWIFT payments require a description or reference number. |
| `COUNTERPARTY_NAME_MISSING` | Enter the counterparty's full first and last name in the **name** parameter. |
| `SEPA_CURRENCY_INVALID` | Verify that the SEPA payment currency is EUR. **Note:** SEPA payments are only permitted in EUR. |

## Validation issues

Once a payment is initiated, the system runs background checks to ensure that the provided information is correct. If the validation fails, the system returns an error.

There are two types of validation issues:

* [Related to the payment recipient's account](#counterparty-account-issues)
* [Related to the payer's account](#payer-account-issues)

### Counterparty account issues

The following errors indicate issues with the payment recipient's account.
To resolve these errors, **contact the payment recipient** and **confirm** the account details.

| Error code | Solution |
| :---- | :---- |
| `COUNTERPARTY_IBAN_NOT_FOUND` | Ensure that the counterparty provides the correct IBAN. |
| `COUNTERPARTY_IBAN_INVALID` | Verify with the counterparty that their account supports SEPA payments. |
| `COUNTERPARTY_BIC_NOT_FOUND` | Ensure that the counterparty provides the correct BIC. |
| `COUNTERPARTY_BIC_INVALID` | Verify with the counterparty that their account supports SWIFT payments. |

### Payer account issues

Payer account issues can be related to the **account configuration**, **account balance**, or **account holder records**. Resolving these issues involves multiple steps. This section lists the [errors](#list-of-errors) and the corresponding [troubleshooting steps](#troubleshooting-steps).

> **Important:** The [`OUTGOING_PAYMENTS_DISABLED`](#outgoing_payments_disabled) error requires resolution through the admin console. If you do not have access to the admin console, contact your company administrator for assistance.

#### List of errors

The following table lists payer account errors with a brief resolution. Click an error code to see the detailed troubleshooting steps.

| Error code | Solution |
| :---- | :---- |
| [`ACCOUNT_NOT_FOUND`](#account_not_found) | Check if the account exists and if the account holder's record is inactive. |
| [`ACCOUNT_LIMIT_EXCEEDED`](#account_limit_exceeded) | Use another account or wait until the limit resets. Alternatively, update the account limits. |
| [`ACCOUNT_STATUS_INVALID`](#account_status_invalid) | Use another account or activate the blocked account. |
| [`INSUFFICIENT_FUNDS`](#insufficient_funds) | Use another account or top up the account balance. |
| [`OUTGOING_PAYMENTS_DISABLED`](#outgoing_payments_disabled) | Use another account or enable outgoing payments for the account. |
| [`CURRENCY_NOT_ALLOWED`](#currency_not_allowed) | Use another account or initiate the payment in a currency allowed on the account. Alternatively, use a foreign exchange payment. |
| [`ACCOUNT_TYPE_NOT_ALLOWED`](#account_type_not_allowed) | Use a current account to initiate the payment. **Savings accounts do not support outgoing payments.** |

#### Troubleshooting steps

> **Note:** Changes to customer records, account status, limits, and account settings can take a few minutes to take effect. Wait before retrying the payment.

##### ACCOUNT_NOT_FOUND

This error occurs when the account does not exist or the account holder's record is inactive. To troubleshoot this error:

1. Verify that the account exists by calling `GET /accounts/{accountId}`.
   * If the account is not found, it does not exist. Use another account to initiate the payment.
   * If the account exists, continue troubleshooting.
2. Check the status of the account holder's record by calling `GET /customers/{customerId}`.
   * If the status is **INACTIVE**, activate the record by calling `PATCH /customers/{customerId}` with the **status** set to **ACTIVE**.
3. Retry initiating the payment.

##### ACCOUNT_LIMIT_EXCEEDED

This error occurs when the payment exceeds the account limits. To troubleshoot this error:

1. Check the existing account limits by calling `GET /accounts/{accountId}/limits`.
   * If you do not want to change the limits, retry the payment later when the limit resets, or use another account.
   * If you want to change the limits, continue troubleshooting.
2. Update the account limits by calling `PUT /accounts/{accountId}/limits`.
3. Retry initiating the payment.

##### ACCOUNT_STATUS_INVALID

This error occurs when the payer's account is blocked or closed. To troubleshoot this error:

1. Check the account status by calling `GET /accounts/{accountId}`.
   * If the account is **CLOSED**, you cannot reopen it. Use another account to initiate the payment.
   * If the account is **BLOCKED**, continue troubleshooting.
2. Activate the account by calling `PATCH /accounts/{accountId}` with the **status** set to **ACTIVE**.
3. Retry initiating the payment.

##### INSUFFICIENT_FUNDS

This error occurs when the payment amount exceeds the available funds on the account or when the account has a negative balance. To troubleshoot this error:

1. Check the account balance by calling `GET /accounts/{accountId}/balance`.
2. Top up the payer's account balance by creating an incoming transaction with `POST /accounts/{accountId}/transactions`.
3. Retry initiating the payment.

##### OUTGOING_PAYMENTS_DISABLED

This error occurs when outgoing payments are disabled on the account. You can resolve this issue in the admin console:

1. Find the payer's account:
   * Go to **Accounts** and search for the account number.
   * Click the account number to open the account details.
2. Enable outgoing payments:
   * Open the account settings.
   * Turn on **Outgoing payments** and save the changes.
3. Retry initiating the payment.

##### CURRENCY_NOT_ALLOWED

This error occurs when a payment is initiated in a currency that is not allowed on the account. The allowed currencies are defined when the account is created, so you cannot add a new currency to an existing account. To troubleshoot this error, choose one of the following options:

* Initiate the payment in a currency allowed on the account.
* Use a different account that allows the payment currency.
* Use a foreign exchange payment:
  1. Initiate a foreign exchange payment by calling `POST /payments/fx`. The response contains the **paymentId**.
  2. Confirm the payment by calling `POST /payments/{paymentId}/confirm`.

##### ACCOUNT_TYPE_NOT_ALLOWED

This error occurs when an outgoing payment is initiated from a savings account. **Savings accounts do not support outgoing payments.** To resolve this issue:

* Use an existing current account, or create a new one by calling `POST /accounts`.

## Permission issues

Permission issues are related to **API user rights**:

| Error code | Solution |
| :---- | :---- |
| `PERMISSION_DENIED` | The API user does not have permission to initiate payments. If you need this permission, contact your company administrator to request it. |

## Technical issues

Technical issues are related to **user authorization** or **server connectivity**:

| Error code | Solution |
| :---- | :---- |
| `UNAUTHORIZED` | The access token has expired. Request a new token and retry initiating the payment. |
| `INTERNAL_ERROR` | An internal server error occurred. Try initiating the payment later. |

## Further steps

If you have completed the troubleshooting steps and still cannot resolve the issue, submit a ticket to the Support Team. Include the following details:

* The payer's **accountId**
* A screenshot of the error message
* The date and time when you initiated the payment and encountered the error
