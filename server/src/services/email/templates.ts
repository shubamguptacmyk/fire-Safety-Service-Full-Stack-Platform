/**
 * AK Fire Safety - Email Templates
 * Responsive, brand-consistent HTML emails with Maharashtra Fire Safety statutory branding.
 */

export interface EmailLayoutOptions {
  title: string;
  previewText?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const { title, previewText, contentHtml, ctaText, ctaUrl } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f5f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .header {
      background: #111827;
      border-bottom: 4px solid #dc2626;
      padding: 24px;
      text-align: center;
    }
    .brand-title {
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      color: #9ca3af;
      font-size: 11px;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .body-content {
      padding: 32px 24px;
    }
    .btn {
      display: inline-block;
      background-color: #dc2626;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 6px;
      margin-top: 20px;
      margin-bottom: 10px;
      text-align: center;
    }
    .highlight-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #dc2626;
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .footer p {
      margin: 4px 0;
    }
    @media only screen and (max-width: 620px) {
      .container {
        width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      .body-content {
        padding: 20px 16px !important;
      }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>` : ""}
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 12px 0;">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <div class="brand-title">AK FIRE SAFETY</div>
            <div class="brand-subtitle">Govt. Licensed Agency Category A · Maharashtra Fire Services</div>
          </div>
          <div class="body-content">
            ${contentHtml}
            ${
              ctaText && ctaUrl
                ? `<div style="text-align: center; margin-top: 24px;">
                     <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
                   </div>`
                : ""
            }
          </div>
          <div class="footer">
            <p><strong>AK Fire Safety & Industrial Protection Systems</strong></p>
            <p>Plot 42, Sector 19A, Vashi, Navi Mumbai, Maharashtra 400705</p>
            <p>GSTIN: 27AAAAA0000A1Z5 | License No: MFS/LA/A-0492</p>
            <p>Direct Support: support@akfiresafety.com | +91 98200 00000</p>
            <p style="margin-top: 12px; font-size: 11px; color: #9ca3af;">
              This is a transactional email regarding your AK Fire Safety account or compliance obligations under the Maharashtra Fire Prevention & Life Safety Act.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 1. Welcome
export function renderWelcomeTemplate(params: { name: string; loginUrl: string }): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Welcome to AK Fire Safety, ${params.name}!</h2>
    <p>Your account has been successfully registered. You can now manage fire protection inventory, track refilling dates, and ensure statutory compliance.</p>
    <div class="highlight-card">
      <h3 style="margin-top: 0; font-size: 15px; color: #dc2626;">Features available in your account:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li>Register extinguishers and view digital QR inspection histories</li>
        <li>Automated reminders for mandatory refill and hydro-testing schedules</li>
        <li>Browse certified ISI and CE fire equipment</li>
        <li>Download statutory GST tax invoices and Form B compliance certificates</li>
      </ul>
    </div>
  `;
  return renderEmailLayout({
    title: "Welcome to AK Fire Safety",
    previewText: "Welcome to AK Fire Safety! Access your portal today.",
    contentHtml,
    ctaText: "Access Your Portal",
    ctaUrl: params.loginUrl,
  });
}

// 2. Email Verification
export function renderEmailVerificationTemplate(params: { name: string; verificationUrl: string }): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 22px; font-weight: 700;">Verify Your Email Address</h2>
    <p style="font-size: 15px; color: #374151;">Hello <strong>${params.name}</strong>,</p>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
      Thank you for registering with <strong>AK Fire Safety Platform</strong>. To activate your account and gain full access to equipment maintenance, fire safety certifications, order tracking, and statutory compliance, please verify your email address.
    </p>
    <div class="highlight-card" style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">
        ⚠️ Security Notice: This verification link is valid for <strong>24 hours</strong> and can only be used once.
      </p>
    </div>
    <p style="font-size: 13px; color: #6b7280; margin-top: 24px; line-height: 1.5;">
      If the button above does not work, please copy and paste the following link into your browser:<br/>
      <a href="${params.verificationUrl}" style="color: #dc2626; word-break: break-all;">${params.verificationUrl}</a>
    </p>
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
      <p style="margin: 0 0 6px 0;">If you did not create an account on AK Fire Safety, you can safely ignore this email.</p>
      <p style="margin: 0;">Need help? Contact our 24/7 compliance support team at <a href="mailto:support@akfiresafety.com" style="color: #dc2626;">support@akfiresafety.com</a> or call +91 98200 00000.</p>
    </div>
  `;
  return renderEmailLayout({
    title: "Verify Your Email - AK Fire Safety",
    previewText: "Please verify your email address to activate your AK Fire Safety account.",
    contentHtml,
    ctaText: "Verify Email Address",
    ctaUrl: params.verificationUrl,
  });
}

// 3. Forgot Password
export function renderForgotPasswordTemplate(params: { name?: string; resetUrl: string; validMinutes?: number }): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
    <p>Dear ${params.name || "Customer"},</p>
    <p>We received a request to reset your password. Click below to choose a new password:</p>
    <div class="highlight-card">
      <p style="margin: 0; color: #4b5563; font-size: 13px;">This link is valid for ${params.validMinutes || 60} minutes and can only be used once.</p>
    </div>
  `;
  return renderEmailLayout({
    title: "Reset Password Request",
    previewText: "Reset your AK Fire Safety password",
    contentHtml,
    ctaText: "Reset Password",
    ctaUrl: params.resetUrl,
  });
}

// 4. Password Reset Success
export function renderPasswordResetSuccessTemplate(params: { name?: string; loginUrl: string }): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Password Reset Successfully</h2>
    <p>Hello ${params.name || "Customer"},</p>
    <p>Your password has been changed successfully. You can now log in with your new credentials.</p>
  `;
  return renderEmailLayout({
    title: "Password Updated",
    previewText: "Your password has been reset successfully",
    contentHtml,
    ctaText: "Log In",
    ctaUrl: params.loginUrl,
  });
}

// 5. Order Confirmation
export function renderOrderConfirmationTemplate(params: {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  grandTotal: number;
  viewOrderUrl: string;
}): string {
  const rows = (params.items || []).map(i => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${i.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${i.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${i.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Order Confirmed: ${params.orderNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>Thank you for your order! Your fire safety equipment order has been confirmed.</p>
    <div class="highlight-card" style="padding: 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="padding: 12px; font-weight: bold; color: #dc2626; text-align: right; background: #fef2f2;">
        Grand Total: ₹${params.grandTotal.toLocaleString('en-IN')}
      </div>
    </div>
  `;
  return renderEmailLayout({
    title: `Order Confirmed: ${params.orderNumber}`,
    previewText: `Order ${params.orderNumber} confirmed. Total ₹${params.grandTotal.toLocaleString('en-IN')}`,
    contentHtml,
    ctaText: "Track Order",
    ctaUrl: params.viewOrderUrl,
  });
}

// 6. Order Dispatched
export function renderOrderDispatchedTemplate(params: {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  carrier?: string;
  viewOrderUrl: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Order Dispatched: ${params.orderNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>Your order is on the way!</p>
    <div class="highlight-card">
      <p style="margin: 4px 0;"><strong>Carrier:</strong> ${params.carrier || "AK Logistics"}</p>
      ${params.trackingNumber ? `<p style="margin: 4px 0;"><strong>Tracking #:</strong> ${params.trackingNumber}</p>` : ""}
    </div>
  `;
  return renderEmailLayout({
    title: `Order Dispatched: ${params.orderNumber}`,
    previewText: `Order ${params.orderNumber} has been dispatched`,
    contentHtml,
    ctaText: "Track Shipment",
    ctaUrl: params.viewOrderUrl,
  });
}

// 7. Order Delivered
export function renderOrderDeliveredTemplate(params: {
  orderNumber: string;
  customerName: string;
  viewOrderUrl: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Order Delivered: ${params.orderNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>Your order has been delivered successfully. Thank you for protecting your premises with AK Fire Safety.</p>
  `;
  return renderEmailLayout({
    title: `Order Delivered: ${params.orderNumber}`,
    previewText: `Order ${params.orderNumber} delivered`,
    contentHtml,
    ctaText: "View Order & Tax Invoice",
    ctaUrl: params.viewOrderUrl,
  });
}

// 8. Order Cancelled
export function renderOrderCancelledTemplate(params: {
  orderNumber: string;
  customerName: string;
  reason?: string;
}): string {
  const contentHtml = `
    <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Order Cancelled: ${params.orderNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>Your order ${params.orderNumber} has been cancelled.</p>
    ${params.reason ? `<p><strong>Reason:</strong> ${params.reason}</p>` : ""}
    <p style="font-size: 13px; color: #6b7280;">Any debited payment will be refunded to your original payment method in 3-5 business days.</p>
  `;
  return renderEmailLayout({
    title: `Order Cancelled: ${params.orderNumber}`,
    previewText: `Order ${params.orderNumber} cancelled`,
    contentHtml,
  });
}

// 9. Quote Requested
export function renderQuoteRequestedTemplate(params: {
  quoteNumber: string;
  customerName: string;
  organization?: string;
  viewQuoteUrl: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Quotation Request Received: ${params.quoteNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>We have received your commercial quote request for ${params.organization || "your organization"}. Our sales team is preparing an itemized GST quote with competitive commercial rates.</p>
  `;
  return renderEmailLayout({
    title: `Quotation Request: ${params.quoteNumber}`,
    previewText: `Quotation request ${params.quoteNumber} received`,
    contentHtml,
    ctaText: "Check Quote Status",
    ctaUrl: params.viewQuoteUrl,
  });
}

// 10. Quote Approved
export function renderQuoteApprovedTemplate(params: {
  quoteNumber: string;
  customerName: string;
  grandTotal: number;
  viewQuoteUrl: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Quotation Approved: ${params.quoteNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>Your quotation ${params.quoteNumber} has been approved.</p>
    <div class="highlight-card">
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #dc2626;">Total: ₹${params.grandTotal.toLocaleString('en-IN')}</p>
    </div>
  `;
  return renderEmailLayout({
    title: `Quotation Approved: ${params.quoteNumber}`,
    previewText: `Quotation ${params.quoteNumber} approved`,
    contentHtml,
    ctaText: "Accept Quotation",
    ctaUrl: params.viewQuoteUrl,
  });
}

// 11. Quote Rejected
export function renderQuoteRejectedTemplate(params: {
  quoteNumber: string;
  customerName: string;
  reason?: string;
}): string {
  const contentHtml = `
    <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Quotation Rejected: ${params.quoteNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>We regret to inform you that quotation ${params.quoteNumber} could not be approved at this time.</p>
    ${params.reason ? `<p><strong>Reason:</strong> ${params.reason}</p>` : ""}
  `;
  return renderEmailLayout({
    title: `Quotation Update: ${params.quoteNumber}`,
    previewText: `Quotation ${params.quoteNumber} status update`,
    contentHtml,
  });
}

// 12. Invoice
export function renderInvoiceTemplate(params: {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  grandTotal: number;
  downloadUrl: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">GST Tax Invoice: ${params.invoiceNumber}</h2>
    <p>Dear ${params.customerName},</p>
    <p>Please find attached your GST Tax Invoice for Order <strong>${params.orderNumber}</strong>.</p>
    <div class="highlight-card">
      <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${params.invoiceNumber}</p>
      <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${params.grandTotal.toLocaleString('en-IN')}</p>
    </div>
  `;
  return renderEmailLayout({
    title: `Tax Invoice ${params.invoiceNumber}`,
    previewText: `Invoice ${params.invoiceNumber} for Order ${params.orderNumber}`,
    contentHtml,
    ctaText: "Download Invoice",
    ctaUrl: params.downloadUrl,
  });
}

// 13. Service Booking
export function renderServiceBookingTemplate(params: {
  bookingId: string;
  customerName: string;
  serviceType: string;
  preferredDate: string;
  address?: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Service Booked: ${params.bookingId}</h2>
    <p>Dear ${params.customerName},</p>
    <p>Your on-site service appointment has been booked.</p>
    <div class="highlight-card">
      <p style="margin: 4px 0;"><strong>Service:</strong> ${params.serviceType}</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${params.preferredDate}</p>
      ${params.address ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${params.address}</p>` : ""}
    </div>
  `;
  return renderEmailLayout({
    title: `Service Booked: ${params.bookingId}`,
    previewText: `Booking ${params.bookingId} confirmed for ${params.preferredDate}`,
    contentHtml,
  });
}

// 14. Service Assignment
export function renderServiceAssignmentTemplate(params: {
  bookingId: string;
  customerName: string;
  serviceType: string;
  technicianName: string;
  technicianPhone?: string;
  scheduledDate: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Technician Assigned: ${params.bookingId}</h2>
    <p>Dear ${params.customerName},</p>
    <p>A licensed technician has been assigned to your service.</p>
    <div class="highlight-card">
      <p style="margin: 4px 0;"><strong>Technician:</strong> ${params.technicianName}</p>
      ${params.technicianPhone ? `<p style="margin: 4px 0;"><strong>Contact:</strong> ${params.technicianPhone}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Service:</strong> ${params.serviceType}</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${params.scheduledDate}</p>
    </div>
  `;
  return renderEmailLayout({
    title: `Technician Assigned: ${params.bookingId}`,
    previewText: `${params.technicianName} assigned for service ${params.bookingId}`,
    contentHtml,
  });
}

// 15. AMC Reminder
export function renderAMCReminderTemplate(params: {
  contractNumber: string;
  buildingName: string;
  expiryDate: string;
  daysLeft: number;
  renewUrl?: string;
}): string {
  const contentHtml = `
    <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">AMC Expiry Alert: ${params.contractNumber}</h2>
    <p>Dear Customer,</p>
    <p>This is a statutory compliance notice for <strong>${params.buildingName}</strong>.</p>
    <div class="highlight-card">
      <p style="margin: 4px 0;"><strong>Contract:</strong> ${params.contractNumber}</p>
      <p style="margin: 4px 0;"><strong>Expires on:</strong> ${params.expiryDate}</p>
      <p style="margin: 4px 0; font-weight: bold; color: #dc2626;">
        ${params.daysLeft <= 0 ? "EXPIRED" : `${params.daysLeft} Day(s) Left`}
      </p>
      <p style="margin-top: 8px; font-size: 12px; color: #6b7280;">Mandatory under Maharashtra Fire Prevention & Life Safety Act to maintain Form B validity.</p>
    </div>
  `;
  return renderEmailLayout({
    title: `AMC Expiry Alert: ${params.contractNumber}`,
    previewText: `AMC for ${params.buildingName} expires on ${params.expiryDate}`,
    contentHtml,
    ctaText: "Renew AMC Contract",
    ctaUrl: params.renewUrl || "https://akfiresafety.com/amc",
  });
}

// 16. Refill Reminder
export function renderRefillReminderTemplate(params: {
  equipmentName: string;
  serialNumber?: string;
  location: string;
  dueDate: string;
  daysLeft: number;
  bookRefillUrl?: string;
}): string {
  const contentHtml = `
    <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Refill Due: ${params.equipmentName}</h2>
    <p>Dear Customer,</p>
    <p>Fire extinguishing media refill is due for equipment at your premises.</p>
    <div class="highlight-card">
      <p style="margin: 4px 0;"><strong>Equipment:</strong> ${params.equipmentName}</p>
      ${params.serialNumber ? `<p style="margin: 4px 0;"><strong>Tag / Serial:</strong> ${params.serialNumber}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Location:</strong> ${params.location}</p>
      <p style="margin: 4px 0;"><strong>Due Date:</strong> ${params.dueDate}</p>
      <p style="margin: 4px 0; font-weight: bold; color: #dc2626;">
        ${params.daysLeft <= 0 ? "REFILL OVERDUE" : `${params.daysLeft} day(s) remaining`}
      </p>
    </div>
  `;
  return renderEmailLayout({
    title: `Refill Due: ${params.equipmentName}`,
    previewText: `Refill due on ${params.dueDate} for ${params.equipmentName}`,
    contentHtml,
    ctaText: "Book Refilling",
    ctaUrl: params.bookRefillUrl || "https://akfiresafety.com/services",
  });
}

// 17. Inspection Reminder
export function renderInspectionReminderTemplate(params: {
  equipmentName: string;
  serialNumber?: string;
  location: string;
  dueDate: string;
  daysLeft: number;
  bookInspectionUrl?: string;
}): string {
  const contentHtml = `
    <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Periodic Inspection Due: ${params.equipmentName}</h2>
    <p>Dear Customer,</p>
    <p>Periodic safety inspection under IS 2190 is due for equipment at <strong>${params.location}</strong>.</p>
    <div class="highlight-card">
      <p style="margin: 4px 0;"><strong>Equipment:</strong> ${params.equipmentName}</p>
      ${params.serialNumber ? `<p style="margin: 4px 0;"><strong>Tag:</strong> ${params.serialNumber}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Due Date:</strong> ${params.dueDate}</p>
      <p style="margin: 4px 0; font-weight: bold; color: #d97706;">
        ${params.daysLeft <= 0 ? "INSPECTION OVERDUE" : `${params.daysLeft} day(s) remaining`}
      </p>
    </div>
  `;
  return renderEmailLayout({
    title: `Inspection Due: ${params.equipmentName}`,
    previewText: `Inspection due on ${params.dueDate} for ${params.equipmentName}`,
    contentHtml,
    ctaText: "Schedule Inspection",
    ctaUrl: params.bookInspectionUrl || "https://akfiresafety.com/services",
  });
}
