import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { Resend } from 'resend';

import dotenv from 'dotenv';
dotenv.config();

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

// Mercado Pago Setup
import { MercadoPagoConfig, Preference } from 'mercadopago';
let mpClient: any = null;
const getMPClient = () => {
  if (!mpClient && process.env.MP_ACCESS_TOKEN) {
    mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  }
  
  return mpClient;
};

// PayPal Setup
import paypal from '@paypal/checkout-server-sdk';
let paypalClient: any = null;
const getPayPalClient = () => {
  if (!paypalClient) {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (clientId && clientSecret) {
      const environment = process.env.NODE_ENV === 'production' 
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
      paypalClient = new paypal.core.PayPalHttpClient(environment);
    }
  }
  return paypalClient;
};

// API Route for Mercado Pago
app.post("/api/pay/mercadopago", async (req, res) => {
  const { items, userId } = req.body;
  const client = getMPClient();

  // Si no hay cliente (falta token), devolvemos un estado de simulación
  if (!client) {
    console.warn("MP_ACCESS_TOKEN not set. Returning simulation mode.");
    return res.json({ 
      init_point: null, 
      simulation: true,
      message: "Configuración de Mercado Pago pendiente en el servidor." 
    });
  }

  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          title: item.name.substring(0, 250), // Mercado Pago tiene límite de caracteres
          unit_price: Number(item.price), // Asegurar que sea número
          quantity: Number(item.quantity),
          currency_id: 'ARS'
        })),
        back_urls: {
          success: `${process.env.APP_URL || 'http://localhost:3000'}/success`,
          failure: `${process.env.APP_URL || 'http://localhost:3000'}/failure`,
          pending: `${process.env.APP_URL || 'http://localhost:3000'}/pending`
        },
        auto_return: 'approved',
        external_reference: userId || 'anonymous',
        binary_mode: true // Solo acepta pagos procesados instantáneamente
      }
    });

    // Usamos sandbox_init_point si el token es de prueba (comienza con APP_USR-)
    const url = process.env.NODE_ENV === 'production' ? result.init_point : result.sandbox_init_point;
    res.json({ init_point: url || result.init_point });
  } catch (error) {
    console.error("Mercado Pago error details:", error);
    res.status(500).json({ error: "Failed to create payment preference", details: error });
  }
});

// API Route for PayPal
app.post("/api/pay/paypal", async (req, res) => {
  const { items, total } = req.body;
  const client = getPayPalClient();

  if (!client) {
    console.warn("PayPal credentials not set. Returning simulation mode.");
    return res.json({ 
      approval_url: null, 
      simulation: true,
      message: "Configuración de PayPal pendiente en el servidor." 
    });
  }

  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: (total / 1000).toFixed(2), // Simplistic conversion for demo
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: (total / 1000).toFixed(2)
            }
          }
        },
        items: items.map((item: any) => ({
          name: item.name,
          unit_amount: {
            currency_code: 'USD',
            value: (item.price / 1000).toFixed(2)
          },
          quantity: item.quantity.toString()
        }))
      }],
      application_context: {
        return_url: `${process.env.APP_URL || 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/failure`
      }
    });

    const order = await client.execute(request);
    const approvalUrl = order.result.links.find((link: any) => link.rel === 'approve').href;
    res.json({ approval_url: approvalUrl });
  } catch (error) {
    console.error("PayPal error:", error);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

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

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
  });
}

startServer();
