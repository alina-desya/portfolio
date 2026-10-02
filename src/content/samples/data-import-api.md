---
title: "Data import API"
kind: API guide
summary: >-
  A developer guide to migrating customers, accounts, and transactions to a banking platform: the import flow,
  statuses, JSON structures, and how to verify and retry an import.
# What a hiring manager should notice. Shown at the top of the sample page.
highlights:
  - Conceptual overview before the tasks, so developers understand the flow first
  - Status reference and business rules that explain why an import gets rejected
  - Annotated JSON examples with parameter tables for every block
  - Request and response examples for each endpoint
note: Anonymized sample. Product names, endpoints, and data are illustrative.
order: 1
---

## Introduction to data import

The data import API helps you migrate your existing data, such as customers, accounts, and transactions, from another system to the platform.

This article covers the following topics:

* [Data import flow](#data-import-flow)
* [Data import statuses](#data-import-statuses)
* [Start data import](#start-data-import):
  * [Compile JSON files](#compile-json-files)
  * [Import JSON files](#import-json-files)
* [Verify data import status](#verify-data-import-status)
* [Retry failed import](#retry-failed-import)

## Data import flow

The data import flow consists of the following steps:

1. You export data from your existing system and create JSON files according to the platform specifications.
2. Your application sends the JSON files to the data import API.
3. The data import API validates the files. For example, it checks whether a customer, account, or transaction already exists on the platform.
4. If the validation is successful, the data import API sends the data to the target services: the customer service or the account service.
5. The customer service or account service processes the data and creates the records.
6. When the records are created, the target service confirms each created record to the data import API.

The data import is asynchronous and runs in the background until it is completed. To verify the import status, call the [get import status](#verify-data-import-status) endpoint.

## Data import statuses

A data import can have the following statuses:

| Status | Description |
| :---- | :---- |
| RECEIVED | The data import is created, and the files are queued for processing. |
| VALIDATING | The data is being validated. |
| REJECTED | The whole data import is rejected. Possible reasons include an incorrect currency or a missing mandatory field. **Note:** If any record fails validation, the whole import is rejected and no data is created. |
| PROCESSING | The data passed validation and is being sent to the target services. |
| COMPLETED | All records are created successfully. |
| FAILED | A technical or configuration error stopped the import. You can [retry the import](#retry-failed-import). |

The following sections explain how to start a data import and verify its status.

## Start data import

To start a data import, complete the following steps:

1. [Compile the JSON files](#compile-json-files).
2. [Import the JSON files](#import-json-files).

### Compile JSON files

The data import consists of three blocks:

* **Customers** – imports customer details to the customer service.
* **Accounts** – imports bank account information to the account service.
* **Transactions** – imports account transaction details to the account service.

Each block must be in a separate JSON file. You can send several files in a single request. Import the data in the following order:

1. Customers
2. Accounts
3. Transactions

> **Note:** Each JSON file has a maximum number of records and a maximum file size, and the whole request has a maximum size. Split large datasets into several files.

The following sections describe the JSON structure for each block.

#### Customers block JSON

The JSON file structure for the customers block is the following:

```json
{
  "customers": [
    {
      "externalCustomerId": "CUST-000123",
      "sourceSystem": "legacy-core",
      "customerType": "INDIVIDUAL",
      "firstName": "Anna",
      "lastName": "Smith",
      "addresses": [
        {
          "type": "RESIDENTIAL",
          "street": "1 Example Street",
          "city": "Berlin",
          "postalCode": "10115",
          "countryCode": "DE"
        }
      ]
    }
  ]
}
```

When importing a customer, the following parameters are mandatory:

| Parameter name | Description | Allowed values |
| :---- | :---- | :---- |
| externalCustomerId | The unique customer reference from the external system. | The ID of the customer in the external system. |
| sourceSystem | The name of the system the data was exported from. | Maximum 50 characters. |
| customerType | The customer type. | **INDIVIDUAL** – a private person. **BUSINESS** – a legal entity. |

> **Note:** Nested objects, such as addresses, identification documents, and contacts, are optional. If you include an object, all its mandatory parameters are required. For descriptions of the optional parameters, see the customer object reference.

#### Accounts block JSON

The JSON file structure for the accounts block is the following:

```json
{
  "accounts": [
    {
      "externalAccountId": "ACC-000456",
      "externalCustomerId": "CUST-000123",
      "status": "ACTIVE",
      "type": "CURRENT",
      "openingDate": "2021-03-15",
      "accountNumber": {
        "type": "IBAN",
        "value": "DE89370400440532013000"
      },
      "countryCode": "DE",
      "bankIdentifier": {
        "type": "BIC",
        "value": "COBADEFFXXX"
      },
      "currency": "EUR"
    }
  ]
}
```

When importing an account, the following parameters are mandatory:

| Parameter name | Description | Allowed values |
| :---- | :---- | :---- |
| externalAccountId | The unique account reference from the external system. | The ID of the account in the external system. |
| externalCustomerId | The unique reference of the account holder from the external system. | The ID of the account holder in the external system. |
| status | The account status. | **ACTIVE**, **BLOCKED**, **CLOSED**. |
| type | The account type. | **CURRENT**, **SAVINGS**, **VIRTUAL**, **INTERNAL**. |
| openingDate | The account opening date. | Date format: **YYYY-MM-DD**. |
| accountNumber: value | The account number. | The account number in the external system. |
| accountNumber: type | The account number type. | **IBAN** – International Bank Account Number. Contains the country code, bank and branch information, and the account number. **BBAN** – Basic Bank Account Number. A country-specific bank account number. |
| countryCode | The account country code. | Country code format: **ISO 3166-1 alpha-2**. |
| bankIdentifier: value | The identification code of the bank. | The bank identification code. |
| bankIdentifier: type | The bank identification code type. | **BIC** – Bank Identifier Code, an 8- or 11-character alphanumeric code. **SORT_CODE** – a six-digit UK domestic bank code. **ROUTING_NUMBER** – a nine-digit ABA routing number that identifies financial institutions within the United States. |
| currency | The account currency. | Currency format: **ISO 4217**. |

> **Note:** Nested objects, such as overdraft, limits, and authorized representatives, are optional. If you include an object, all its mandatory parameters are required. For descriptions of the optional parameters, see the account object reference.

#### Transactions block JSON

The JSON file structure for the transactions block is the following:

```json
{
  "transactions": [
    {
      "externalTransactionId": "TRX-000789",
      "externalAccountId": "ACC-000456",
      "groupId": "GRP-000101",
      "type": "INCOMING_TRANSFER",
      "amount": 250.00,
      "currency": "EUR",
      "valueDate": "2023-01-10",
      "bookingDate": "2023-01-11"
    }
  ]
}
```

When importing account transactions, the following parameters are mandatory:

| Parameter name | Description | Allowed values |
| :---- | :---- | :---- |
| externalTransactionId | The unique transaction reference from the external system. | The ID of the transaction in the external system. |
| externalAccountId | The unique account reference from the external system. | The ID of the account where the transaction occurred. |
| groupId | The identifier that groups related transactions in the external system. | The grouping ID used in the external system. |
| type | The transaction type. | To get the list of available transaction types, call `GET /transaction-types`. |
| amount | The transaction amount. | The transaction amount in the external system. |
| currency | The transaction currency. | Currency format: **ISO 4217**. |
| valueDate | The date on which the transaction takes effect on the account balance. It must be the same as or earlier than the booking date. | Date format: **YYYY-MM-DD**. |
| bookingDate | The date on which the transaction was recorded on the account. | Date format: **YYYY-MM-DD**. |

### Import JSON files

When the JSON files are compiled, call the `POST /imports` endpoint to import them.

The following query parameters are required:

| Parameter | Type | Description | Example |
| :---- | :---- | :---- | :---- |
| sourceSystem | string | The name of the system the data was exported from. | `legacy-core` |
| batchReference | string | Your reference for this import. | `MIGRATION-2023-01` |

If the request is accepted, the endpoint returns the **202 Accepted** response with the **importId**. Use this ID to [verify the data import status](#verify-data-import-status).

```json
{
  "importId": "IMP-1090",
  "status": "RECEIVED"
}
```

After the files are imported, the system checks whether the records already exist on the platform. The main business rules for data import are the following:

* A customer can be imported only once. If the customer already exists on the platform, the import is rejected.
* An account can be imported only if the account holder already exists on the platform.
* A transaction can be imported only if the related account already exists on the platform.

## Verify data import status

To check the import status, call the `GET /imports/{importId}` endpoint. Use the **importId** returned by the `POST /imports` endpoint as the path parameter.

The endpoint returns the following information:

| Parameter | Description |
| :---- | :---- |
| status | The data import status. See [Data import statuses](#data-import-statuses). |
| validation | The validation progress: the number of validated records and the number of records that failed validation. |
| errors | The records that failed validation, the affected parameters, and the error messages. |
| progress | The number of records processed by the target services: **totalRecords** – the number of records in the import. **sentRecords** – the number of records sent to the target services. **createdRecords** – the number of records created. **failedRecords** – the number of records that were not created. **retriedRecords** – the number of failed records that were sent again. |

### Get import status example

The following sample response shows a data import that was rejected because one account record failed validation. No records were sent to the target services or created.

The response includes a reference to the failed record and the error message:

```json
{
  "importId": "IMP-1090",
  "status": "REJECTED",
  "validation": {
    "validatedRecords": 1500,
    "failedRecords": 1
  },
  "errors": [
    {
      "block": "accounts",
      "externalId": "ACC-000456",
      "parameter": "currency",
      "message": "Currency code 'EUO' is not a valid ISO 4217 code."
    }
  ],
  "progress": {
    "totalRecords": 1500,
    "sentRecords": 0,
    "createdRecords": 0,
    "failedRecords": 0,
    "retriedRecords": 0
  }
}
```

To fix a rejected import, correct the records listed in **errors** and start a new import.

## Retry failed import

To retry a failed import, call the `POST /imports/{importId}/retry` endpoint. Use the **importId** returned by the `POST /imports` endpoint as the path parameter.

Retrying does not modify the imported data. The same data is sent again to the target services, so a retry helps only if the import failed due to configuration or technical issues. You can retry only imports in the **FAILED** status.
