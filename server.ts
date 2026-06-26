import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { Resend } from 'resend';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Initialize Resend (Lazy)
let resend: any = null;
const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// API Route for Subscriptions
app.post("/api/subscribe", async (req, res) => {
  const { name, email, phone, dni, plan } = req.body;
  
  console.log(`[SUBSCRIPTION] New signup: ${name} (${email}) for plan ${plan.name}`);

  try {
    const resendClient = getResend();
    if (resendClient) {
      await resendClient.emails.send({
        from: 'Nova3D <onboarding@resend.dev>',
        to: [email, 'caponettopeppers@gmail.com'],
        subject: `Confirmá tu suscripción Nova3D - Plan ${plan.name}`,
        html: `
          <h1>¡Hola ${name}!</h1>
          <p>Gracias por registrarte para el sorteo mensual de Nova3D.</p>
          <p>Tu plan: <strong>${plan.name} ($${plan.price}/mes)</strong></p>
          <p>Tu DNI registrado: ${dni}</p>
          <hr />
          <p>Para activar tus beneficios y recibir tu número de la suerte, por favor completa el pago mensual en Mercado Pago.</p>
        `
      });
    } else {
      console.warn("RESEND_API_KEY not found. Email logged but not sent.");
    }

    res.json({ success: true, message: "Subscription processed" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// API Route for Mercado Pago checkout preference
app.post("/api/mercadopago/preference", async (req, res) => {
  const { items, payerEmail } = req.body;
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "El carrito está vacío" });
  }

  // Generate a friendly mock if the access token is not configured
  if (!accessToken) {
    console.warn("MP_ACCESS_TOKEN no configurado en variables de entorno. Usando Sandbox Mock.");
    
    // Simulate a Mercado Pago Sandbox checkout link based on total sum
    const total = items.reduce((acc: number, curr: any) => acc + (curr.price * (curr.quantity || 1)), 0);
    const mockPrefId = "pref_" + Math.random().toString(36).substring(2, 12);
    
    // We return a beautiful custom visual screen simulating the MP checkout,
    // or standard sandbox links if they prefer. Let's make it go to a beautiful simulation redirect
    // so they can see exactly how it looks and transitions!
    return res.json({ 
      init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${mockPrefId}`,
      preferenceId: mockPrefId,
      is_sandbox: true,
      total: total
    });
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: items.map((item: any) => ({
          id: item.id || Math.random().toString(36).substring(2, 6),
          title: item.name,
          quantity: item.quantity || 1,
          unit_price: Number(item.price),
          currency_id: "ARS",
          picture_url: item.images && item.images[0] ? item.images[0] : undefined
        })),
        payer: {
          email: payerEmail || "comprador@nova3d.com"
        },
        back_urls: {
          success: `${req.headers.origin || 'http://localhost:3000'}/?payment_status=success`,
          failure: `${req.headers.origin || 'http://localhost:3000'}/?payment_status=failure`,
          pending: `${req.headers.origin || 'http://localhost:3000'}/?payment_status=pending`
        },
        auto_return: "approved"
      })
    });

    const data = await response.json();
    if (data.init_point) {
      res.json({ 
        init_point: data.init_point, 
        preferenceId: data.id,
        is_sandbox: false 
      });
    } else {
      console.error("Error de Mercado Pago:", data);
      res.status(400).json({ success: false, error: data.message || "No se pudo generar la preferencia de pago" });
    }
  } catch (error: any) {
    console.error("Mercado Pago error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Route to process successful payment and send a beautifully formatted invoice email
app.post("/api/mercadopago/success-payment", async (req, res) => {
  const { product, quantity, totalAmount, payerEmail, locationText } = req.body;
  const orderNumber = "NV" + Math.floor(100000 + Math.random() * 900000);
  const currentDate = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  console.log(`[PAYMENT APPROVED] Order ${orderNumber} for product "${product?.name}" (qty: ${quantity}) total: $${totalAmount}`);

  try {
    const resendClient = getResend();
    if (resendClient && payerEmail) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Factura de Compra Nova3D</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
            .header { background-color: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; }
            .header h1 span { color: #f97316; }
            .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.8; font-weight: 500; }
            .status-badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px; margin-top: 16px; letter-spacing: 1px; }
            .body { padding: 32px 24px; }
            .invoice-details { border-bottom: 2px dashed #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
            .details-grid { width: 100%; border-collapse: collapse; }
            .details-grid td { padding: 6px 0; font-size: 13px; line-height: 1.5; vertical-align: top; }
            .details-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; tracking: 0.5px; width: 35%; }
            .details-value { color: #0f172a; font-weight: 500; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            .items-table th { background-color: #f8fafc; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            .items-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .item-image { width: 48px; height: 48px; object-fit: contain; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 4px; }
            .item-name { font-weight: 700; color: #0f172a; margin: 0; }
            .item-category { font-size: 11px; color: #64748b; margin: 2px 0 0; }
            .totals-container { margin-top: 24px; background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
            .totals-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #475569; }
            .totals-row.grand-total { font-size: 18px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0; margin-top: 12px; padding-top: 12px; }
            .totals-row.grand-total .val { color: #3483fa; }
            .next-steps { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-top: 32px; text-align: left; }
            .next-steps h3 { margin: 0 0 8px; font-size: 14px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; }
            .next-steps p { margin: 0; font-size: 13px; color: #1e3a1e; line-height: 1.6; }
            .footer { background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6; }
            .footer a { color: #3483fa; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nova<span>3D</span></h1>
              <p>IMPRESIÓN 3D PREMIUM Y DISEÑO PERSONALIZADO</p>
              <span class="status-badge">Comprobante de Pago Electrónico</span>
            </div>
            
            <div class="body">
              <div class="invoice-details">
                <table class="details-grid">
                  <tr>
                    <td class="details-label">Número de Factura</td>
                    <td class="details-value">#${orderNumber} (Factura Tipo B)</td>
                  </tr>
                  <tr>
                    <td class="details-label">Fecha de Emisión</td>
                    <td class="details-value">${currentDate}</td>
                  </tr>
                  <tr>
                    <td class="details-label">Medio de Pago</td>
                    <td class="details-value" style="color: #3483fa; font-weight: bold;">Mercado Pago (Acreditado)</td>
                  </tr>
                  <tr>
                    <td class="details-label">Destinatario</td>
                    <td class="details-value">${payerEmail}</td>
                  </tr>
                  <tr>
                    <td class="details-label">Destino de Envío</td>
                    <td class="details-value">Enviado a ${locationText || "Domicilio del Comprador"}</td>
                  </tr>
                </table>
              </div>

              <h3 style="font-size: 15px; font-weight: 800; margin: 0 0 16px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Detalle del Pedido</h3>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 15%;">Item</th>
                    <th style="width: 50%;">Descripción</th>
                    <th style="width: 15%; text-align: center;">Cant.</th>
                    <th style="width: 20%; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align: center;">
                      <img src="${product?.images?.[0] || 'https://picsum.photos/seed/nova/100'}" class="item-image" alt="Product Image">
                    </td>
                    <td>
                      <p class="item-name">${product?.name}</p>
                      <p class="item-category">Material: PLA+ Premium de alta resistencia</p>
                    </td>
                    <td style="text-align: center; font-weight: 600;">${quantity}</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">$ ${(product?.price * quantity).toLocaleString('es-AR')}</td>
                  </tr>
                </tbody>
              </table>

              <div class="totals-container">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="font-size: 14px; color: #475569; padding: 4px 0;">Subtotal</td>
                    <td style="font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">$ ${(product?.price * quantity).toLocaleString('es-AR')}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #475569; padding: 4px 0;">Costo de Envío</td>
                    <td style="font-size: 14px; color: #10b981; font-weight: bold; text-align: right;">¡GRATIS!</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #475569; padding: 4px 0;">IVA (21%)</td>
                    <td style="font-size: 14px; color: #64748b; text-align: right;">Incluido</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="font-size: 18px; font-weight: 800; color: #0f172a; padding: 12px 0 0;">Total Neto</td>
                    <td style="font-size: 20px; font-weight: 800; color: #3483fa; text-align: right; padding: 12px 0 0;">$ ${Number(totalAmount).toLocaleString('es-AR')}</td>
                  </tr>
                </table>
              </div>

              <div class="next-steps">
                <h3>Siguientes Pasos de tu Pedido:</h3>
                <p>Nuestra granja de impresión 3D automatizada ya comenzó a procesar tu pedido. En las próximas horas recibirás un correo de seguimiento con el estado del diseño 3D y el despacho en la dirección proporcionada.</p>
              </div>
            </div>

            <div class="footer">
              <p>Este correo electrónico sirve como comprobante de pago oficial para tu transacción.</p>
              <p>¿Tenés alguna duda o querés personalizar tu modelo? <br/>Escribinos a <a href="mailto:caponettopeppers@gmail.com">soporte@nova3d.com</a> o contactanos por nuestra línea directa.</p>
              <p style="margin-top: 16px; font-size: 11px; opacity: 0.7;">&copy; 2026 Nova3D Argentina. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await resendClient.emails.send({
        from: 'Nova3D <onboarding@resend.dev>',
        to: [payerEmail, 'caponettopeppers@gmail.com'],
        subject: `🧾 Tu factura de compra Nova3D - Orden #${orderNumber}`,
        html: emailHtml
      });
      console.log(`[PAYMENT EMAIL] Invoice successfully sent to ${payerEmail}`);
    } else {
      console.warn("RESEND_API_KEY no configurada o falta email del pagador. Factura simulada en consola.");
    }

    res.json({ success: true, orderNumber });
  } catch (error) {
    console.error("Payment invoice email error:", error);
    res.status(500).json({ success: false, error: "Failed to send invoice email" });
  }
});

export default app;

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  // Only listen if not being imported as a module (e.g. by Vercel)
  if (process.env.NODE_ENV !== "production" || process.env.RENDER || process.env.RAILWAY_STATIC_URL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
