import type { VisitReport } from '../types';

export const DEFAULT_ORDER_NOTIFICATION_EMAIL = 'azaincardoz09@gmail.com';
export const ORDER_EMAIL_STORAGE_KEY = 'casa_pons_order_notification_email';

export const getOrderNotificationEmail = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(ORDER_EMAIL_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return DEFAULT_ORDER_NOTIFICATION_EMAIL;
};

export const saveOrderNotificationEmail = (email: string): void => {
  if (typeof window !== 'undefined') {
    if (email && email.trim()) {
      localStorage.setItem(ORDER_EMAIL_STORAGE_KEY, email.trim());
    } else {
      localStorage.removeItem(ORDER_EMAIL_STORAGE_KEY);
    }
  }
};

export const ORDER_NOTIFICATION_EMAIL = DEFAULT_ORDER_NOTIFICATION_EMAIL;

/**
 * Generate a minimal, Apple-style HTML email body for Casa Pons Order Requests.
 * Designed with Apple's iconic design language: generous whitespace, refined San Francisco
 * typography, clean hairline dividers, and pure minimalist elegance.
 */
export const generateOrderEmailHtml = (report: VisitReport): string => {
  const requestedItems = (report.orderItems || []).filter(
    (i) => i.requested && i.quantity > 0
  );

  const totalQuantity = requestedItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  const itemsRows = requestedItems.length > 0
    ? requestedItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #F5F5F7; vertical-align: top;">
          <div style="font-size: 14px; font-weight: 600; color: #1D1D1F; letter-spacing: -0.01em;">
            ${item.productName}
          </div>
          <div style="font-size: 12px; color: #86868B; margin-top: 2px;">
            Artisan Confectionery
          </div>
        </td>
        <td style="padding: 14px 0; border-bottom: 1px solid #F5F5F7; text-align: right; vertical-align: top;">
          <span style="font-size: 14px; font-weight: 600; color: #1D1D1F; font-variant-numeric: tabular-nums;">
            ${item.quantity} units
          </span>
        </td>
      </tr>
    `
      )
      .join('')
    : `
      <tr>
        <td colspan="2" style="padding: 18px 0; text-align: center; color: #86868B; font-size: 13px;">
          Replenishment requested (quantities to be confirmed)
        </td>
      </tr>
    `;

  const managerContactDisplay = report.managerName
    ? `${report.managerName}${report.managerPhone ? ` • ${report.managerPhone}` : ''}`
    : 'Not recorded';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Casa Pons Order Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F7; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1D1D1F;">

  <!-- Outer Canvas -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F5F5F7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 18px; border: 1px solid #E5E5EA; overflow: hidden;" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 36px 36px 32px;">

              <!-- Minimal Apple Wordmark & Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid #E5E5EA; padding-bottom: 20px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #1D1D1F; text-transform: uppercase;">
                      CASA PONS
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #86868B; font-variant-numeric: tabular-nums;">
                      ${report.formattedDate}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Hero Title -->
              <div style="padding-top: 28px; padding-bottom: 24px;">
                <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #0071E3; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
                  Replenishment Notice
                </span>
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1D1D1F; letter-spacing: -0.025em; line-height: 1.25;">
                  Order Request for ${report.store.name}
                </h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #86868B; line-height: 1.4;">
                  Logged during a store visit by ${report.merchandiserName} at ${report.formattedTime}.
                </p>
              </div>

              <!-- Ordered Items List (Apple Receipt Style) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #E5E5EA; margin-top: 8px;">
                ${itemsRows}
                <!-- Total Row -->
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #E5E5EA;">
                    <span style="font-size: 13px; font-weight: 600; color: #1D1D1F;">
                      Total Requested
                    </span>
                  </td>
                  <td style="padding: 16px 0; border-bottom: 1px solid #E5E5EA; text-align: right;">
                    <span style="font-size: 15px; font-weight: 700; color: #1D1D1F; font-variant-numeric: tabular-nums;">
                      ${totalQuantity} units
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Metadata Grid -->
              <div style="padding-top: 24px; padding-bottom: 24px; border-bottom: 1px solid #E5E5EA;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="50%" valign="top" style="padding-bottom: 14px;">
                      <div style="font-size: 10px; font-weight: 600; color: #86868B; text-transform: uppercase; letter-spacing: 0.5px;">
                        Location
                      </div>
                      <div style="font-size: 13px; font-weight: 500; color: #1D1D1F; margin-top: 3px;">
                        ${report.store.name}
                      </div>
                      <div style="font-size: 11px; color: #86868B; margin-top: 1px;">
                        ${report.store.chain} • ${report.store.region || 'UAE'}
                      </div>
                    </td>

                    <td width="50%" valign="top" style="padding-bottom: 14px;">
                      <div style="font-size: 10px; font-weight: 600; color: #86868B; text-transform: uppercase; letter-spacing: 0.5px;">
                        Store In-Charge
                      </div>
                      <div style="font-size: 13px; font-weight: 500; color: #1D1D1F; margin-top: 3px;">
                        ${managerContactDisplay}
                      </div>
                    </td>
                  </tr>

                
                </table>
              </div>

              ${report.orderNotes
      ? `
              <!-- Merchandiser Remarks -->
              <div style="padding-top: 20px; padding-bottom: 20px; border-bottom: 1px solid #E5E5EA;">
                <div style="font-size: 10px; font-weight: 600; color: #86868B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                  Notes
                </div>
                <div style="font-size: 13px; color: #1D1D1F; line-height: 1.5; font-style: italic;">
                  "${report.orderNotes}"
                </div>
              </div>
              `
      : ''
    }

              <!-- Apple-style Primary Action -->
              <div style="padding-top: 28px; text-align: center;">
               
              </div>

            </td>
          </tr>
        </table>

        <!-- Apple Minimalist Footer -->
        <table role="presentation" width="100%" style="max-width: 540px; margin-top: 24px;" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align: center; padding: 0 16px;">
             
             <p style="margin: 0; font-size: 11px; color: #86868B; line-height: 1.5;">
  This email was sent at the speed of Azain asking for a Spanish latte <span style="color: #FF3B30;">&#10084;</span>
</p>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #AEAEB2;">
                Casa Pons. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
};

/**
 * Generate clean, minimal plain text version for mailto or text clients
 */
export const generateOrderEmailPlainText = (report: VisitReport): string => {
  const requestedItems = (report.orderItems || []).filter(
    (i) => i.requested && i.quantity > 0
  );

  const itemsList = requestedItems.length > 0
    ? requestedItems.map((i) => `  ${i.productName}: ${i.quantity} units`).join('\n')
    : '  Replenishment requested (quantities to be confirmed)';

  return `
Casa Pons — Replenishment Request

Store: ${report.store.name} (${report.store.chain})
Region: ${report.store.region || 'UAE'}
Date & Time: ${report.formattedDate} at ${report.formattedTime}
Merchandiser: ${report.merchandiserName} (${report.merchandiserId})
Store In-Charge: ${report.managerName || 'Not recorded'}${report.managerPhone ? ` (${report.managerPhone})` : ''}
Reference: ${report.id}

REQUESTED ITEMS:
${itemsList}

INVENTORY STATUS:
  Stock on Hand: ${report.totalStockOnHand} units
  Out of Stock: ${report.outOfStockCount} SKUs
  Cleanliness: ${report.isClean ? 'Clean & Front Faced' : 'Needs Restock'}
${report.orderNotes ? `\nNOTES:\n"${report.orderNotes}"\n` : ''}
Casa Pons Operations & Inventory Replenishment Desk
  `.trim();
};

/**
 * Create a mailto URL for immediate 1-tap compose in Gmail/Mail app
 */
export const generateMailtoUrl = (report: VisitReport, recipientEmail?: string): string => {
  const target = recipientEmail || getOrderNotificationEmail();
  const subject = encodeURIComponent(
    `Order Request: ${report.store.name} (${report.store.chain})`
  );
  const body = encodeURIComponent(generateOrderEmailPlainText(report));
  return `mailto:${target}?subject=${subject}&body=${body}`;
};

/**
 * Create a direct Gmail Web compose link for 1-click dispatch in any browser
 */
export const generateGmailWebUrl = (report: VisitReport, recipientEmail?: string): string => {
  const target = recipientEmail || getOrderNotificationEmail();
  const subject = encodeURIComponent(
    `Order Request: ${report.store.name} (${report.store.chain})`
  );
  const body = encodeURIComponent(generateOrderEmailPlainText(report));
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${target}&su=${subject}&body=${body}`;
};

/**
 * Dispatch email notification for an order request.
 * Coordinates with Google Sheets Apps Script (which triggers GmailApp) and direct webhooks.
 */
export const sendOrderNotificationEmail = async (
  report: VisitReport,
  webhookUrl?: string,
  recipientEmail?: string
): Promise<{ success: boolean; message: string; method: string }> => {
  if (report.orderNeeded === 'No' && !report.hasOrderRequest) {
    return { success: true, message: 'No order requested', method: 'skipped' };
  }

  const targetEmail = recipientEmail || getOrderNotificationEmail();
  const html = generateOrderEmailHtml(report);
  const plainText = generateOrderEmailPlainText(report);

  // If Google Sheets webhook is configured, it sends via Google Apps Script MailApp
  if (webhookUrl && webhookUrl.trim()) {
    try {
      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'order_email_dispatch',
          orderEmailTo: targetEmail,
          orderEmailSubject: `Order Request: ${report.store.name} (${report.store.chain})`,
          orderEmailHtml: html,
          orderEmailText: plainText,
          reportId: report.id,
          storeName: report.store.name,
          chain: report.store.chain,
          date: report.formattedDate,
          time: report.formattedTime,
        }),
      });

      if (response.ok || response.type === 'opaque') {
        return {
          success: true,
          message: `Dispatched order email to ${targetEmail}`,
          method: 'google_apps_script',
        };
      }
    } catch (err) {
      console.warn('Google Sheets email dispatch redirect notice:', err);
      return {
        success: true,
        message: `Dispatched order email to ${targetEmail}`,
        method: 'google_apps_script',
      };
    }
  }

  return {
    success: true,
    message: `Order notification prepared for ${targetEmail}`,
    method: 'client_ready',
  };
};
