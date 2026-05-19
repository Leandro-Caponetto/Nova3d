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
