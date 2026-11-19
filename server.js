import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5.5";
const maxInputChars = 12000;
const maxHistoryItems = 24;

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: "8mb" }));
app.use("/api/", rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan. Coba lagi sebentar." }
}));
app.use(express.static("public", { extensions: ["html"] }));

const instructions = `Kamu adalah JACCKS AI, asisten AI yang cerdas, ramah, lugas, dan membantu.
Jawab dalam bahasa yang digunakan pengguna. Berikan jawaban akurat dan terstruktur.
Jika tidak yakin, katakan dengan jujur. Jangan mengaku telah melakukan tindakan yang belum dilakukan.`;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY), model });
});

app.post("/api/chat", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "API key belum dipasang. Isi OPENAI_API_KEY di file .env." });
  }

  const { message, imageData, previousResponseId } = req.body ?? {};
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Pesan tidak boleh kosong." });
  }
  if (message.length > maxInputChars) {
    return res.status(413).json({ error: `Pesan terlalu panjang. Maksimal ${maxInputChars} karakter.` });
  }
  if (imageData !== undefined && (typeof imageData !== "string" || !/^data:image\/(png|jpeg|webp|gif);base64,/.test(imageData) || imageData.length > 7_000_000)) {
    return res.status(400).json({ error: "Gambar tidak valid atau terlalu besar (maksimal sekitar 5 MB)." });
  }
  if (previousResponseId !== undefined &&
      (typeof previousResponseId !== "string" || previousResponseId.length > 200)) {
    return res.status(400).json({ error: "ID percakapan tidak valid." });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let stream;
  try {
    stream = await client.responses.create({
      model,
      instructions,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: message.trim() || "Jelaskan gambar ini." },
          ...(imageData ? [{ type: "input_image", image_url: imageData }] : [])
        ]
      }],
      ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
      stream: true
    });
  } catch (error) {
    console.error("OpenAI request failed:", error?.status || error?.name || "unknown");
    const status = error?.status === 401 ? 502 : 502;
    return res.status(status).json({
      error: error?.status === 401
        ? "API key ditolak. Periksa OPENAI_API_KEY."
        : "Tidak bisa menghubungi layanan AI. Periksa koneksi, model, dan saldo API."
    });
  }

  res.status(200);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.flushHeaders?.();

  let closed = false;
  res.on("close", () => { if (!res.writableEnded) closed = true; });

  try {
    for await (const event of stream) {
      if (closed) break;
      if (event.type === "response.output_text.delta") {
        res.write(`data: ${JSON.stringify({ type: "delta", text: event.delta })}\n\n`);
      } else if (event.type === "response.completed") {
        res.write(`data: ${JSON.stringify({
          type: "done",
          responseId: event.response.id
        })}\n\n`);
      } else if (event.type === "response.failed" || event.type === "error") {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Model gagal menyelesaikan jawaban." })}\n\n`);
      }
    }
  } catch (error) {
    console.error("Stream failed:", error?.name || "unknown");
    if (!closed) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Koneksi terputus saat menerima jawaban." })}\n\n`);
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
});

app.use((err, _req, res, _next) => {
  if (err?.type === "entity.too.large") return res.status(413).json({ error: "Permintaan terlalu besar." });
  console.error("Server error:", err?.name || "unknown");
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

app.listen(port, () => {
  console.log(`JACCKS AI berjalan di http://localhost:${port}`);
});
