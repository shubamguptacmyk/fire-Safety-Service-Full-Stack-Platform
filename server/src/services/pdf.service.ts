import PDFDocument from "pdfkit";
import { IInvoice } from "../models/Invoice";
import { IQuote } from "../models/Quote";
import { IOrder } from "../models/Order";
import { IAMCContract } from "../models/AMCContract";

/**
 * Builds a professional GST Tax Invoice PDF buffer
 */
export function generateInvoicePdfBuffer(invoice: IInvoice, order?: IOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header Brand
      doc.fontSize(18).fillColor("#B91C1C").text("AK FIRE SAFETY SERVICE", { align: "left" });
      doc.fontSize(8).fillColor("#4B5563")
        .text("Industrial Fire Protection, AMC & Cylinders | Navi Mumbai, Maharashtra", { align: "left" })
        .text(`GSTIN: ${invoice.company.gstin} | PAN: ${invoice.company.pan || "AABCA1234F"} | State Code: 27`, { align: "left" })
        .text(`Phone: ${invoice.company.phone} | Email: ${invoice.company.email}`, { align: "left" });

      doc.moveDown(1);
      doc.strokeColor("#D1D5DB").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.8);

      // Title & Invoice Meta
      const startY = doc.y;
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text("TAX INVOICE", 40, startY);
      doc.font("Helvetica").fontSize(9).fillColor("#374151")
        .text(`Invoice No: ${invoice.invoiceNumber}`, 40, startY + 20)
        .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}`, 40, startY + 34)
        .text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, 40, startY + 48);

      doc.fontSize(9).fillColor("#374151")
        .text(`Order Ref: ${order?.orderNumber || "Direct"}`, 340, startY + 20)
        .text(`Payment Mode: ${(order?.paymentMethod || "Prepaid").toUpperCase()}`, 340, startY + 34)
        .text(`Place of Supply: ${invoice.customer.address.state || "Maharashtra"} (27)`, 340, startY + 48);

      doc.moveDown(4.5);
      doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.8);

      // Bill To / Ship To
      const partyY = doc.y;
      doc.fontSize(10).fillColor("#111827").text("Billed & Delivered To:", 40, partyY, { underline: true });
      doc.fontSize(9).fillColor("#374151")
        .text(`${invoice.customer.name}${invoice.customer.companyName ? ` (${invoice.customer.companyName})` : ""}`, 40, partyY + 16)
        .text(`Phone: ${invoice.customer.phone} | Email: ${invoice.customer.email || "N/A"}`, 40, partyY + 30)
        .text(`Address: ${invoice.customer.address.line1}, ${invoice.customer.address.city}, ${invoice.customer.address.state} - ${invoice.customer.address.pincode}`, 40, partyY + 44)
        .text(`Customer GSTIN: ${invoice.customer.gstin || "Unregistered / Consumer"}`, 40, partyY + 58);

      doc.moveDown(5);

      // Items Table Header
      const tableTop = doc.y;
      doc.rect(40, tableTop, 515, 20).fill("#F3F4F6");
      doc.fillColor("#111827").fontSize(8).font("Helvetica-Bold");
      doc.text("#", 45, tableTop + 6);
      doc.text("Item Description", 65, tableTop + 6);
      doc.text("HSN/SAC", 235, tableTop + 6);
      doc.text("Qty", 295, tableTop + 6);
      doc.text("Rate (₹)", 335, tableTop + 6);
      doc.text("Tax (18%)", 405, tableTop + 6);
      doc.text("Total (₹)", 485, tableTop + 6);

      let currentY = tableTop + 24;
      doc.font("Helvetica").fontSize(8).fillColor("#374151");

      invoice.items.forEach((item, index) => {
        const itemTotal = item.totalAmount || item.taxableAmount + (item.cgstAmount || 0) + (item.sgstAmount || 0);
        doc.text(String(index + 1), 45, currentY);
        doc.text(item.name.slice(0, 36), 65, currentY);
        doc.text(item.hsnSac || "84241000", 235, currentY);
        doc.text(String(item.quantity), 295, currentY);
        doc.text(item.unitPrice.toLocaleString("en-IN"), 335, currentY);
        doc.text((item.cgstAmount + item.sgstAmount || Math.round(item.taxableAmount * 0.18)).toLocaleString("en-IN"), 405, currentY);
        doc.text(Math.round(itemTotal).toLocaleString("en-IN"), 485, currentY);

        currentY += 18;
      });

      doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(40, currentY).lineTo(555, currentY).stroke();
      currentY += 10;

      // Summary Box
      const summaryX = 330;
      doc.fontSize(9).fillColor("#4B5563");
      doc.text("Taxable Value:", summaryX, currentY);
      doc.text(`₹ ${invoice.totals.taxableAmount.toLocaleString("en-IN")}`, 470, currentY, { align: "right" });
      currentY += 15;

      if (invoice.totals.cgstTotal > 0 || invoice.totals.sgstTotal > 0) {
        doc.text("CGST (9%):", summaryX, currentY);
        doc.text(`₹ ${invoice.totals.cgstTotal.toLocaleString("en-IN")}`, 470, currentY, { align: "right" });
        currentY += 15;
        doc.text("SGST (9%):", summaryX, currentY);
        doc.text(`₹ ${invoice.totals.sgstTotal.toLocaleString("en-IN")}`, 470, currentY, { align: "right" });
        currentY += 15;
      } else if (invoice.totals.igstTotal > 0) {
        doc.text("IGST (18%):", summaryX, currentY);
        doc.text(`₹ ${invoice.totals.igstTotal.toLocaleString("en-IN")}`, 470, currentY, { align: "right" });
        currentY += 15;
      }

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#B91C1C");
      doc.text("Grand Total (INR):", summaryX, currentY);
      doc.text(`₹ ${Math.round(invoice.totals.grandTotal).toLocaleString("en-IN")}`, 470, currentY, { align: "right" });

      currentY += 30;
      doc.font("Helvetica").fontSize(8).fillColor("#6B7280");
      doc.text("Terms & Conditions:", 40, currentY);
      doc.text("1. All fire equipment conforms to Bureau of Indian Standards (IS 15683 / IS 2171 / IS 5290).", 40, currentY + 12);
      doc.text("2. Warranty covers manufacturing defects for 12 months from delivery date.", 40, currentY + 22);
      doc.text("3. Refilling and hydrostatic pressure testing must be performed as per IS 2190 guidelines.", 40, currentY + 32);

      doc.text("For AK FIRE SAFETY SERVICE", 400, currentY + 20, { align: "center" });
      doc.text("Authorized Signatory", 400, currentY + 50, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Builds a professional B2B Quotation PDF buffer
 */
export function generateQuotePdfBuffer(quote: IQuote): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header
      doc.fontSize(18).fillColor("#B91C1C").text("AK FIRE SAFETY SERVICE", { align: "left" });
      doc.fontSize(8).fillColor("#4B5563")
        .text("Government Approved Fire Protection Engineers & AMC Contractors", { align: "left" })
        .text("Plot 44, MIDC Turbhe, Navi Mumbai, Maharashtra | GSTIN: 27AABCA1234F1Z8", { align: "left" })
        .text("Contact: +91 98200 88910 | Email: quotes@akfiresafety.example", { align: "left" });

      doc.moveDown(1);
      doc.strokeColor("#B91C1C").lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // Quote Title
      const startY = doc.y;
      doc.fontSize(14).fillColor("#111827").text("COMMERCIAL QUOTATION / PROPOSAL", 40, startY);
      doc.fontSize(9).fillColor("#374151")
        .text(`Quote Reference: ${quote.quoteNumber}`, 40, startY + 20)
        .text(`Date of Issue: ${new Date(quote.createdAt).toLocaleDateString("en-IN")}`, 40, startY + 34)
        .text(`Validity: Until ${new Date(quote.validUntil).toLocaleDateString("en-IN")}`, 40, startY + 48);

      doc.fontSize(9).fillColor("#374151")
        .text(`Client: ${quote.customer.companyName}`, 330, startY + 20)
        .text(`Attention: ${quote.customer.name}`, 330, startY + 34)
        .text(`Phone: ${quote.customer.phone} | Email: ${quote.customer.email}`, 330, startY + 48);

      if (quote.customer.gstNumber) {
        doc.text(`Client GSTIN: ${quote.customer.gstNumber}`, 330, startY + 62);
      }

      doc.moveDown(5.5);

      // Scope / Requirements
      doc.fontSize(10).fillColor("#111827").text("Scope of Supply & Client Requirements:", 40, doc.y);
      doc.fontSize(8.5).fillColor("#4B5563").text(quote.requirements || "Industrial safety and compliance requirements.", 40, doc.y + 4);
      doc.moveDown(2);

      // Items Table Header
      const tableTop = doc.y;
      doc.rect(40, tableTop, 515, 20).fill("#FEF2F2");
      doc.fillColor("#991B1B").fontSize(8).font("Helvetica-Bold");
      doc.text("#", 45, tableTop + 6);
      doc.text("Product / Service Item", 65, tableTop + 6);
      doc.text("Qty", 295, tableTop + 6);
      doc.text("Unit Price (₹)", 345, tableTop + 6);
      doc.text("GST", 425, tableTop + 6);
      doc.text("Total (₹)", 485, tableTop + 6);

      let currentY = tableTop + 24;
      doc.font("Helvetica").fontSize(8).fillColor("#374151");

      quote.items.forEach((item, index) => {
        doc.text(String(index + 1), 45, currentY);
        doc.text(item.name.slice(0, 42), 65, currentY);
        doc.text(String(item.quantity), 295, currentY);
        doc.text(item.unitPrice.toLocaleString("en-IN"), 345, currentY);
        doc.text(`${item.gstPercent || 18}%`, 425, currentY);
        doc.text(Math.round(item.total).toLocaleString("en-IN"), 485, currentY);

        currentY += 18;
      });

      doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(40, currentY).lineTo(555, currentY).stroke();
      currentY += 10;

      // Summary
      const summaryX = 330;
      doc.fontSize(9).fillColor("#4B5563");
      doc.text("Subtotal:", summaryX, currentY);
      doc.text(`₹ ${Math.round(quote.pricing.subtotal).toLocaleString("en-IN")}`, 470, currentY, { align: "right" });
      currentY += 16;

      doc.text("Applicable GST (18%):", summaryX, currentY);
      doc.text(`₹ ${Math.round(quote.pricing.gst).toLocaleString("en-IN")}`, 470, currentY, { align: "right" });
      currentY += 16;

      doc.font("Helvetica-Bold").fontSize(11).fillColor("#B91C1C");
      doc.text("Grand Total (INR):", summaryX, currentY);
      doc.text(`₹ ${Math.round(quote.pricing.grandTotal).toLocaleString("en-IN")}`, 470, currentY, { align: "right" });

      currentY += 30;
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#111827");
      doc.text("Terms & Conditions:", 40, currentY);
      currentY += 12;

      doc.font("Helvetica").fontSize(8).fillColor("#4B5563");
      const terms = quote.terms && quote.terms.length > 0 ? quote.terms : [
        "1. Rates quoted are valid for 30 days from proposal date.",
        "2. Standard 18% GST applicable unless specified.",
        "3. Payment terms: 50% advance with PO, 50% on installation/delivery.",
        "4. Equipment certified to Bureau of Indian Standards (BIS/ISI).",
      ];

      terms.forEach((t) => {
        doc.text(`• ${t}`, 40, currentY);
        currentY += 12;
      });

      currentY += 10;
      doc.text("Prepared by Commercial B2B Desk", 400, currentY, { align: "center" });
      doc.text("AK FIRE SAFETY SERVICE", 400, currentY + 12, { align: "center" });
      doc.text("(Authorized Signatory)", 400, currentY + 38, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Builds statutory Maharashtra Fire Act (Form B) Bi-Annual Certificate PDF buffer
 */
export function generateFormBPdfBuffer(amc: IAMCContract): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 45, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header Brand & Government Reference
      doc.fontSize(16).fillColor("#B91C1C").text("AK FIRE SAFETY SERVICE", { align: "center" });
      doc.fontSize(8.5).fillColor("#374151")
        .text("Licensed Fire Safety Agency | Directorate of Maharashtra Fire Services", { align: "center" })
        .text("License No: MFS/LA/2021/784 | Validity: 31-Dec-2027 | State: Maharashtra (27)", { align: "center" })
        .text("Plot 44, MIDC Turbhe, Navi Mumbai — 400705 | Tel: +91 98200 88910", { align: "center" });

      doc.moveDown(1);
      doc.strokeColor("#B91C1C").lineWidth(2).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Certificate Title
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827")
        .text("FORM 'B'", { align: "center" })
        .fontSize(10).fillColor("#4B5563")
        .text("[See Section 3(3) and Rule 4(2)]", { align: "center" })
        .fontSize(10).fillColor("#111827")
        .text("BI-ANNUAL CERTIFICATE OF FIRE FIGHTING SYSTEM MAINTENANCE", { align: "center" });

      doc.moveDown(1.5);

      const certY = doc.y;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827")
        .text(`Certificate No: ${amc.formBNumber || `FB-${amc.contractNumber}`}`, 45, certY)
        .text(`Date of Issue: ${new Date().toLocaleDateString("en-IN")}`, 380, certY);

      doc.font("Helvetica").fontSize(9).fillColor("#374151")
        .text(`AMC Reference: ${amc.contractNumber}`, 45, certY + 16)
        .text(`Valid Until: ${new Date(amc.endDate).toLocaleDateString("en-IN")}`, 380, certY + 16);

      doc.moveDown(2.5);

      // Certificate Body Statement
      doc.font("Helvetica").fontSize(9.5).fillColor("#1F2937").lineGap(4);
      doc.text(
        `This is to certify that we, M/s AK FIRE SAFETY SERVICE, have carried out inspection, maintenance, and testing of the fire prevention and life safety measures installed in the premises detailed below, in accordance with the provisions of the Maharashtra Fire Prevention and Life Safety Measures Act, 2006 (Mah. III of 2007) and the rules made thereunder:`,
        { align: "justify" }
      );

      doc.moveDown(1);

      // Premises & Client Details Box
      const boxTop = doc.y;
      doc.rect(45, boxTop, 505, 100).fillAndStroke("#F9FAFB", "#E5E7EB");
      doc.fillColor("#111827").fontSize(9).font("Helvetica-Bold");

      doc.text("1. Name of Occupier / Owner:", 55, boxTop + 10);
      doc.font("Helvetica").text(`${amc.clientName}${amc.companyName ? ` (${amc.companyName})` : ""}`, 230, boxTop + 10);

      doc.font("Helvetica-Bold").text("2. Type of Premises:", 55, boxTop + 26);
      doc.font("Helvetica").text(amc.premisesType, 230, boxTop + 26);

      doc.font("Helvetica-Bold").text("3. Location / Address:", 55, boxTop + 42);
      doc.font("Helvetica").text(amc.location, 230, boxTop + 42, { width: 300 });

      doc.font("Helvetica-Bold").text("4. Contact / Phone:", 55, boxTop + 64);
      doc.font("Helvetica").text(`${amc.phone} | ${amc.email}`, 230, boxTop + 64);

      doc.font("Helvetica-Bold").text("5. Service Plan & Frequency:", 55, boxTop + 80);
      doc.font("Helvetica").text(`${amc.planName} (${amc.frequency})`, 230, boxTop + 80);

      doc.moveDown(7.5);

      // Covered Equipment Summary
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text("Summary of Inspected & Certified Fire Protection Systems:");
      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc.rect(45, tableTop, 505, 18).fill("#F3F4F6");
      doc.fillColor("#111827").fontSize(8.5).font("Helvetica-Bold");
      doc.text("#", 55, tableTop + 5);
      doc.text("System Description / Equipment Type", 85, tableTop + 5);
      doc.text("Total Units", 370, tableTop + 5);
      doc.text("Operational Condition", 440, tableTop + 5);

      let itemY = tableTop + 22;
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151");

      const equipList = amc.coveredEquipment && amc.coveredEquipment.length > 0 ? amc.coveredEquipment : [
        { description: "ABC Dry Powder Fire Extinguishers (IS 15683)", quantity: amc.equipmentCount || 10 },
        { description: "CO2 Fire Extinguishers (IS 2878)", quantity: 4 },
        { description: "Hydrant Landing Valves & Hose Reel Drums (IS 5290 / IS 884)", quantity: 2 },
      ];

      equipList.forEach((eq, idx) => {
        doc.text(String(idx + 1), 55, itemY);
        doc.text(eq.description.slice(0, 45), 85, itemY);
        doc.text(String(eq.quantity), 370, itemY);
        doc.fillColor("#047857").text("Satisfactory / Good", 440, itemY);
        doc.fillColor("#374151");
        itemY += 16;
      });

      doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(45, itemY + 4).lineTo(550, itemY + 4).stroke();

      // Statutory Declaration
      doc.moveDown(2);
      doc.font("Helvetica-Oblique").fontSize(8.5).fillColor("#4B5563").lineGap(2);
      doc.text(
        "Declaration: We hereby declare that all fire protection equipment and installations in the above premises have been inspected, serviced, and found in good working condition in compliance with Maharashtra Fire Act statutory safety standards.",
        { align: "justify" }
      );

      // Signatures
      doc.moveDown(3);
      const signY = doc.y;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827");
      doc.text("Seal & Signature of Licensed Agency", 45, signY);
      doc.text("Authorized Fire Safety Officer", 370, signY);

      doc.font("Helvetica").fontSize(8).fillColor("#6B7280");
      doc.text("AK FIRE SAFETY SERVICE (Regd.)", 45, signY + 35);
      doc.text("Directorate of Maharashtra Fire Services", 370, signY + 35);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
