import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (env.EMAIL_MODE === "smtp" && env.EMAIL_HOST) {
      transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: parseInt(env.EMAIL_PORT, 10) || 587,
        secure: parseInt(env.EMAIL_PORT, 10) === 465,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      });
    } else {
      // In development, create test/stream transport or mock logger
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "windows",
        buffer: true,
      });
    }
  }
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

import * as templates from "./email";

export class EmailService {
  /**
   * Primary dispatcher
   */
  static async sendMail(options: SendEmailOptions): Promise<boolean> {
    try {
      const rawFrom = env.EMAIL_FROM || "AK Fire Safety <no-reply@akfiresafety.com>";
      const from = rawFrom.includes("<") && rawFrom.includes(">")
        ? rawFrom
        : `"AK Fire Safety" <${env.EMAIL_USER || "no-reply@akfiresafety.com"}>`;

      if (env.EMAIL_MODE === "development" || !env.EMAIL_HOST) {
        logger.info(`[MOCK EMAIL DISPATCH] To: ${options.to} | Subject: "${options.subject}"`);
        return true;
      }

      const client = getTransporter();
      await client.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]+>/g, ""),
        attachments: options.attachments,
      });

      return true;
    } catch (err) {
      logger.error("Failed to dispatch email:", err);
      return false;
    }
  }

  // --- 17 Core Business Email Templates ---

  // 1. Welcome
  static async sendWelcome(to: string, name: string) {
    const loginUrl = `${env.CLIENT_URL}/login`;
    const html = templates.renderWelcomeTemplate({ name, loginUrl });
    return this.sendMail({ to, subject: "Welcome to AK Fire Safety", html });
  }

  // 2. Email Verification
  static async sendEmailVerification(to: string, name: string, verificationUrl: string) {
    const html = templates.renderEmailVerificationTemplate({ name, verificationUrl });
    return this.sendMail({ to, subject: "Verify Your Email Address - AK Fire Safety", html });
  }

  // 3. Forgot Password
  static async sendForgotPassword(to: string, resetUrl: string, name?: string) {
    const html = templates.renderForgotPasswordTemplate({ name, resetUrl });
    return this.sendMail({ to, subject: "Reset Your AK Fire Safety Password", html });
  }

  // 4. Password Reset
  static async sendPasswordReset(to: string, resetUrl: string, name?: string) {
    const html = templates.renderForgotPasswordTemplate({ name, resetUrl });
    return this.sendMail({ to, subject: "Reset Your AK Fire Safety Password", html });
  }

  static async sendPasswordResetSuccess(to: string, name?: string) {
    const loginUrl = `${env.CLIENT_URL}/login`;
    const html = templates.renderPasswordResetSuccessTemplate({ name, loginUrl });
    return this.sendMail({ to, subject: "Password Reset Successfully - AK Fire Safety", html });
  }

  // 5. Order Confirmation
  static async sendOrderConfirmation(
    to: string,
    orderNumber: string,
    grandTotal: number,
    customerName: string = "Valued Customer",
    items: Array<{ name: string; quantity: number; price: number }> = []
  ) {
    const viewOrderUrl = `${env.CLIENT_URL}/orders`;
    const html = templates.renderOrderConfirmationTemplate({
      orderNumber,
      customerName,
      items,
      grandTotal,
      viewOrderUrl,
    });
    return this.sendMail({ to, subject: `Order Confirmed: ${orderNumber}`, html });
  }

  // 6. Order Dispatched
  static async sendOrderDispatched(
    to: string,
    orderNumber: string,
    customerName: string = "Valued Customer",
    trackingNumber?: string,
    carrier?: string
  ) {
    const viewOrderUrl = `${env.CLIENT_URL}/orders`;
    const html = templates.renderOrderDispatchedTemplate({
      orderNumber,
      customerName,
      trackingNumber,
      carrier,
      viewOrderUrl,
    });
    return this.sendMail({ to, subject: `Order Dispatched: ${orderNumber}`, html });
  }

  // 7. Order Delivered
  static async sendOrderDelivered(to: string, orderNumber: string, customerName: string = "Valued Customer") {
    const viewOrderUrl = `${env.CLIENT_URL}/orders`;
    const html = templates.renderOrderDeliveredTemplate({
      orderNumber,
      customerName,
      viewOrderUrl,
    });
    return this.sendMail({ to, subject: `Order Delivered: ${orderNumber}`, html });
  }

  // 8. Order Cancelled
  static async sendOrderCancelled(
    to: string,
    orderNumber: string,
    customerName: string = "Valued Customer",
    reason?: string
  ) {
    const html = templates.renderOrderCancelledTemplate({
      orderNumber,
      customerName,
      reason,
    });
    return this.sendMail({ to, subject: `Order Cancelled: ${orderNumber}`, html });
  }

  // Status update wrapper for compatibility
  static async sendOrderStatus(to: string, orderNumber: string, status: string, trackingNote?: string) {
    if (status.toLowerCase() === "dispatched" || status.toLowerCase() === "shipped") {
      return this.sendOrderDispatched(to, orderNumber, "Customer", trackingNote);
    }
    if (status.toLowerCase() === "delivered") {
      return this.sendOrderDelivered(to, orderNumber, "Customer");
    }
    if (status.toLowerCase() === "cancelled") {
      return this.sendOrderCancelled(to, orderNumber, "Customer", trackingNote);
    }
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #dc2626; margin-top: 0;">Order Update: ${status}</h2>
        <p>Your order <strong>${orderNumber}</strong> is now <strong>${status}</strong>.</p>
        ${trackingNote ? `<p style="background: #f9f9f9; padding: 10px; border-left: 3px solid #dc2626;">${trackingNote}</p>` : ""}
        <div style="margin: 25px 0;">
          <a href="${env.CLIENT_URL}/orders" style="background: #dc2626; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Status</a>
        </div>
      </div>
    `;
    return this.sendMail({ to, subject: `Order ${orderNumber} Status: ${status}`, html });
  }

  // 9. Quote Requested
  static async sendQuoteRequested(
    to: string,
    quoteNumber: string,
    customerName: string = "Valued Customer",
    organization?: string
  ) {
    const viewQuoteUrl = `${env.CLIENT_URL}/quotes`;
    const html = templates.renderQuoteRequestedTemplate({
      quoteNumber,
      customerName,
      organization,
      viewQuoteUrl,
    });
    return this.sendMail({ to, subject: `Commercial Quote Request Received: ${quoteNumber}`, html });
  }

  // 10. Quote Approved
  static async sendQuoteApproved(
    to: string,
    quoteNumber: string,
    grandTotal: number,
    customerName: string = "Valued Customer"
  ) {
    const viewQuoteUrl = `${env.CLIENT_URL}/quotes`;
    const html = templates.renderQuoteApprovedTemplate({
      quoteNumber,
      customerName,
      grandTotal,
      viewQuoteUrl,
    });
    return this.sendMail({ to, subject: `Commercial Quote Approved: ${quoteNumber}`, html });
  }

  // 11. Quote Rejected
  static async sendQuoteRejected(
    to: string,
    quoteNumber: string,
    customerName: string = "Valued Customer",
    reason?: string
  ) {
    const html = templates.renderQuoteRejectedTemplate({
      quoteNumber,
      customerName,
      reason,
    });
    return this.sendMail({ to, subject: `Quotation Notice: ${quoteNumber}`, html });
  }

  // Compatibility wrapper
  static async sendQuoteStatus(to: string, quoteNumber: string, status: string, note?: string) {
    if (status.toLowerCase() === "approved") {
      return this.sendQuoteApproved(to, quoteNumber, 0, "Customer");
    }
    if (status.toLowerCase() === "rejected") {
      return this.sendQuoteRejected(to, quoteNumber, "Customer", note);
    }
    return this.sendQuoteRequested(to, quoteNumber, "Customer");
  }

  // 12. Invoice
  static async sendInvoice(
    to: string,
    invoiceNumber: string,
    orderNumber: string,
    grandTotal: number,
    customerName: string = "Valued Customer",
    pdfBuffer?: Buffer
  ) {
    const downloadUrl = `${env.CLIENT_URL}/invoices`;
    const html = templates.renderInvoiceTemplate({
      invoiceNumber,
      orderNumber,
      customerName,
      grandTotal,
      downloadUrl,
    });
    const attachments = pdfBuffer
      ? [
          {
            filename: `${invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : undefined;

    return this.sendMail({
      to,
      subject: `Tax Invoice ${invoiceNumber} - AK Fire Safety`,
      html,
      attachments,
    });
  }

  // 13. Service Booking
  static async sendServiceBooking(
    to: string,
    bookingId: string,
    serviceType: string,
    date: string,
    customerName: string = "Valued Customer",
    address?: string
  ) {
    const html = templates.renderServiceBookingTemplate({
      bookingId,
      customerName,
      serviceType,
      preferredDate: date,
      address,
    });
    return this.sendMail({ to, subject: `Service Booking Confirmed: ${bookingId}`, html });
  }

  // 14. Service Assignment
  static async sendServiceAssignment(
    to: string,
    bookingId: string,
    serviceType: string,
    technicianName: string,
    technicianPhone?: string,
    scheduledDate: string = "Scheduled Date",
    customerName: string = "Valued Customer"
  ) {
    const html = templates.renderServiceAssignmentTemplate({
      bookingId,
      customerName,
      serviceType,
      technicianName,
      technicianPhone,
      scheduledDate,
    });
    return this.sendMail({ to, subject: `Technician Assigned for Service ${bookingId}`, html });
  }

  // 15. AMC Reminder
  static async sendAMCReminder(
    to: string,
    contractNumber: string,
    buildingName: string,
    expiryDate: string,
    daysLeft: number,
    renewUrl?: string
  ) {
    const html = templates.renderAMCReminderTemplate({
      contractNumber,
      buildingName,
      expiryDate,
      daysLeft,
      renewUrl,
    });
    return this.sendMail({ to, subject: `Statutory AMC Renewal Notice: ${contractNumber}`, html });
  }

  // 16. Refill Reminder
  static async sendRefillReminder(
    to: string,
    equipmentName: string,
    location: string,
    dueDate: string,
    daysLeft: number,
    serialNumber?: string
  ) {
    const html = templates.renderRefillReminderTemplate({
      equipmentName,
      serialNumber,
      location,
      dueDate,
      daysLeft,
    });
    return this.sendMail({ to, subject: `Safety Refill Due: ${equipmentName}`, html });
  }

  // 17. Inspection Reminder
  static async sendInspectionReminder(
    to: string,
    equipmentName: string,
    location: string,
    dueDate: string,
    daysLeft: number,
    serialNumber?: string
  ) {
    const html = templates.renderInspectionReminderTemplate({
      equipmentName,
      serialNumber,
      location,
      dueDate,
      daysLeft,
    });
    return this.sendMail({ to, subject: `Periodic Inspection Due: ${equipmentName}`, html });
  }
}
