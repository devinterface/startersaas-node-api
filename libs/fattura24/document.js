import { $ } from "moneysafe";
import moment from "moment";
import json2xml from "json2xml";

const makeInvoiceDocument = (stripePayload, account, user) => {
  const finalCents = stripePayload.data.object.amount_paid / 100;
  const netPriceCents = (100 * finalCents) / 122;
  const vatAmountCents = finalCents - netPriceCents;

  const final = $(finalCents).toFixed();
  const netPrice = $(netPriceCents).toFixed();
  const vatAmount = $(vatAmountCents).toFixed();

  const paidDate = moment
    .unix(stripePayload.data.object.created)
    .format("YYYY-MM-DD");
  const from = moment
    .unix(stripePayload.data.object.lines.data[0].period.start)
    .format("DD/MM/YYYY");
  const to = moment
    .unix(stripePayload.data.object.lines.data[0].period.end)
    .format("DD/MM/YYYY");
  const nickname = stripePayload.data.object.lines.data[0].plan.nickname;

  const document = {
    Fattura24: {
      Document: {
        TotalWithoutTax: netPrice,
        VatAmount: vatAmount,
        DocumentType: "FE",
        SendEmail: "false",
        FePaymentCode: "MP08",
        Object: "Articoli e Social rata piano abbonamento",
        Total: final,
        PaymentMethodName: "Carta di credito",
        Payments: [
          {
            Payment: {
              Date: paidDate,
              Paid: true,
              Amount: final,
            },
          },
        ],
        CustomerName: account.companyName,
        CustomerAddress: account.companyBillingAddress,
        CustomerVatCode: account.companyVat,
        CustomerCellPhone: account.companyPhone,
        CustomerEmail: user.email,
        FeCustomerPec: account.companyPec,
        FeDestinationCode: account.companySdi,
        FootNotes: "Grazie per aver utilizzato Articoli e Social",
        Rows: [
          {
            Row: {
              Code: nickname,
              Description: `Rinnovo abbonamento "${nickname}" Articoli e Social dal ${from} al ${to}`,
              Price: netPrice,
              VatCode: 22,
              VatDescription: "22%",
              Qty: 1,
            },
          },
        ],
      },
    },
  };
  return json2xml(document, { header: true });
};

export default makeInvoiceDocument;
