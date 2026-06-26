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
