/**
 * Centralized Invoice Generator for Stinchar
 * Generates a professional, print-ready invoice HTML and triggers the browser print dialog.
 */

export const generateInvoice = (order) => {
    const companyDetails = {
        name: "STINCHAR E-COMMERCE SOLUTIONS",
        address: "123 Innovation Hub, Tech City, 560001",
        email: "support@stinchar.com",
        phone: "+91 800-STINCHAR",
        gst: "29AAAAA0000A1Z5"
    };

    const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const itemsHtml = order.orderItems.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <div style="font-weight: 600; color: #111;">${item.name}</div>
                ${item.variantName ? `<div style="font-size: 10px; color: #666;">Variant: ${item.variantName}</div>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">₹${(item.qty * item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Invoice - ${order._id}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #333; margin: 0; padding: 40px; line-height: 1.5; background: #fff; }
            .invoice-container { max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
            .logo { font-size: 32px; font-weight: 800; letter-spacing: -1.5px; color: #000; }
            .company-info { text-align: right; font-size: 12px; color: #666; }
            .invoice-title { font-size: 48px; font-weight: 200; letter-spacing: -2px; color: #eee; margin: 0; margin-bottom: 40px; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .meta-section h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 12px; }
            .meta-section p { margin: 0; font-size: 14px; font-weight: 500; color: #111; }
            table { width: 100%; border-collapse: collapse; margin: 40px 0; }
            th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; padding: 12px; border-bottom: 2px solid #111; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .grand-total { border-top: 2px solid #111; margin-top: 12px; padding-top: 12px; font-size: 20px; font-weight: 800; color: #000; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
            .status-paid { background: #e6fdf5; color: #059669; }
            .status-pending { background: #fffbeb; color: #d97706; }
            .footer { margin-top: 100px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #aaa; }
            @media print {
                body { padding: 0; }
                .invoice-container { width: 100%; max-width: none; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <div>
                    <div class="logo">STINCHAR.</div>
                    <div class="status-badge ${order.isPaid ? 'status-paid' : 'status-pending'}">
                        ${order.isPaid ? 'Payment Received' : 'Payment Pending'}
                    </div>
                </div>
                <div class="company-info">
                    <strong>${companyDetails.name}</strong><br>
                    ${companyDetails.address}<br>
                    ${companyDetails.email}<br>
                    GSTIN: ${companyDetails.gst}
                </div>
            </div>

            <h2 class="invoice-title">Tax Invoice</h2>

            <div class="meta-grid">
                <div class="meta-section">
                    <h4>Billed To</h4>
                    <p>${order.shippingAddress?.fullName}</p>
                    <p style="color: #666; font-weight: 400; font-size: 12px; margin-top: 4px;">
                        ${order.shippingAddress?.address}<br>
                        ${order.shippingAddress?.city} - ${order.shippingAddress?.postalCode}<br>
                        Contact: ${order.shippingAddress?.phone}
                    </p>
                </div>
                <div class="meta-section" style="text-align: right;">
                    <h4>Invoice Details</h4>
                    <p>#${order._id.toUpperCase()}</p>
                    <p style="color: #666; font-weight: 400; font-size: 12px; margin-top: 4px;">
                        Date: ${date}<br>
                        Method: ${order.paymentMethod?.toUpperCase()}
                    </p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="totals">
                <div class="total-row">
                    <span style="color: #999;">Items Subtotal</span>
                    <span>₹${order.itemsPrice?.toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span style="color: #999;">Tax (GST)</span>
                    <span>₹${order.taxPrice?.toLocaleString() || '0'}</span>
                </div>
                <div class="total-row">
                    <span style="color: #999;">Shipping & Handling</span>
                    <span>₹${order.shippingPrice?.toLocaleString() || '0'}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total Amount</span>
                    <span>₹${order.totalPrice?.toLocaleString()}</span>
                </div>
            </div>

            <div class="footer">
                This is a computer-generated document and does not require a physical signature. <br>
                Thank you for choosing Stinchar for your architectural and construction needs.
            </div>
        </div>
    </body>
    </html>
    `;

    const win = window.open("", "_blank", "width=900,height=1000");
    win.document.write(invoiceHtml);
    win.document.close();
    win.focus();
    
    // Trigger print after resources (fonts/images) are likely loaded
    setTimeout(() => {
        win.print();
        // Optional: Close window after printing
        // win.close();
    }, 1000);
};
