import 'dotenv/config'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { v2 as cloudinary } from 'cloudinary'
import { SYSTEM_PROMPT } from './src/prompts/systemPrompt.js'
import { buildImagePrompt } from './src/prompts/buildUserPrompt.js'

// ── Cloudinary ────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadToCloudinary(base64, timeOfDay, ip) {
  return cloudinary.uploader.upload(
    `data:image/png;base64,${base64}`,
    {
      folder: 'saffire-daylight',
      context: { time_of_day: timeOfDay, ip: ip || '' },
    }
  )
}

async function getCloudinaryImages() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'saffire-daylight/',
    max_results: 200,
    context: true,
  })
  return result.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// ── Express ───────────────────────────────────────────────────────────────────
const app = express()
app.use(express.json({ limit: '20mb' }))

const API_KEY = process.env.GEMINI_API_KEY
const TOOL_PASSWORD = process.env.TOOL_PASSWORD

// Password check middleware for all /api routes
app.use('/api', (req, res, next) => {
  if (!TOOL_PASSWORD) return next()
  const provided = req.headers['x-tool-password']
  if (provided !== TOOL_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }
  next()
})

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildBriefPrompt(targetTime) {
  const imagePrompt = buildImagePrompt(targetTime)
  return `You are analysing a source photograph to produce an image-editing brief.

First, inventory every visible element in the photograph in precise detail — list all furniture, fabrics, surfaces, materials, textures, artwork, architectural features, fixtures, decorations, and any other objects. Note their exact positions, colours, and appearances.

Then, using that inventory as the preservation checklist, write a detailed image-editing brief that describes ONLY how the lighting should change to achieve the following transformation. Every single item in your inventory must remain pixel-for-pixel identical in the output. Only light, shadow, and sky change.

Target transformation:
${imagePrompt}

Format your output as:
SCENE INVENTORY:
[bullet list of every visible element]

LIGHTING TRANSFORMATION BRIEF:
[precise instructions for lighting changes only]

Conclude the brief with: "Every element in the scene inventory above must remain completely unchanged. Only the lighting, shadows, sky, and lamp glow change."`
}

// ── API routes ────────────────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => res.json({ ok: true }))

const convertLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Daily limit reached (10 conversions per 24 hours). Please try again tomorrow.' },
})

app.post('/api/convert', convertLimiter, async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in .env' })
  }

  const { sourceBase64, mimeType, targetTime } = req.body
  if (!sourceBase64 || !mimeType || !targetTime) {
    return res.status(400).json({ error: 'Missing sourceBase64, mimeType, or targetTime' })
  }

  try {
    // ── Step 1: Vision model produces scene inventory + transformation brief ──
    const briefResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: sourceBase64 } },
                { text: buildBriefPrompt(targetTime) },
              ],
            },
          ],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }),
      },
    )

    if (!briefResponse.ok) {
      const err = await briefResponse.json().catch(() => ({}))
      return res.status(briefResponse.status).json({
        error: `Gemini Vision error: ${err?.error?.message || briefResponse.statusText}`,
      })
    }

    const briefData = await briefResponse.json()
    const editingBrief = briefData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!editingBrief) {
      return res.status(500).json({ error: 'Gemini Vision returned no content.' })
    }

    // ── Step 2: Image model applies the brief ─────────────────────────────────
    const imageResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: sourceBase64 } },
                {
                  text: `You are a precision image editor. Apply ONLY the lighting transformation described below to this photograph. Every object, surface, texture, material, furniture piece, artwork, fixture, and architectural element must remain completely identical to the source — do not alter, move, recolour, or redraw any of them. Only light, shadow, sky, and lamp glow change.

${editingBrief}

The output must match the source image's exact aspect ratio, framing, and composition — do not zoom, crop, pan, or reframe.`,
                },
              ],
            },
          ],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      },
    )

    if (!imageResponse.ok) {
      const err = await imageResponse.json().catch(() => ({}))
      return res.status(imageResponse.status).json({
        error: `Gemini image generation error: ${err?.error?.message || imageResponse.statusText}`,
      })
    }

    const imageData = await imageResponse.json()
    const imagePart = imageData?.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)

    if (!imagePart) {
      const candidate = imageData?.candidates?.[0]
      const finishReason = candidate?.finishReason
      const textPart = candidate?.content?.parts?.find(p => p.text)?.text
      console.error('No image in response:', JSON.stringify({ finishReason, textPart, promptFeedback: imageData?.promptFeedback }, null, 2))
      return res.status(500).json({
        error: `Gemini returned no image. Reason: ${finishReason || 'unknown'}${textPart ? ` — "${textPart.slice(0, 120)}"` : ''}`,
      })
    }

    // ── Upload to Cloudinary (fire and forget) ────────────────────────────────
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip
    uploadToCloudinary(imagePart.inlineData.data, targetTime, ip).catch(err =>
      console.error('Cloudinary upload failed:', err.message)
    )

    res.json({ imageBase64: imagePart.inlineData.data })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unexpected server error' })
  }
})

// ── Admin gallery ─────────────────────────────────────────────────────────────
app.get('/admin', async (req, res) => {
  const provided = req.query.pw
  if (TOOL_PASSWORD && provided !== TOOL_PASSWORD) {
    return res.status(401).send(`
      <html><body style="font-family:sans-serif;padding:40px;background:#111;color:#ccc">
        <form method="GET">
          <input name="pw" type="password" placeholder="Password" autofocus
            style="padding:8px 12px;background:#1e1e1e;border:1px solid #333;color:#fff;border-radius:4px;font-size:14px" />
          <button type="submit"
            style="margin-left:8px;padding:8px 16px;background:#e2e2e5;color:#111;border:none;border-radius:4px;cursor:pointer;font-size:14px">
            Enter
          </button>
        </form>
      </body></html>
    `)
  }

  const timeLabels = { dawn: 'Pre-dawn / Dawn', dusk: 'Dusk', night: 'Night', overcast: 'Overcast Day' }
  let rows = []
  try { rows = await getCloudinaryImages() } catch (err) { console.error('Cloudinary fetch failed:', err.message) }

  const cards = rows.map(r => {
    const tod = r.context?.custom?.time_of_day || ''
    const ip = r.context?.custom?.ip || '—'
    const date = new Date(r.created_at).toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    return `
      <div style="background:#1e1f21;border:1px solid #2f3033;border-radius:8px;overflow:hidden">
        <img src="${r.secure_url}" style="width:100%;display:block;cursor:zoom-in" onclick="window.open(this.src,'_blank')" />
        <div style="padding:10px 12px">
          <div style="font-size:13px;color:#e2e2e5;font-weight:500">${timeLabels[tod] || tod || '—'}</div>
          <div style="font-size:11px;color:#55555a;margin-top:3px">${date}</div>
          <div style="font-size:11px;color:#3a3a3f;margin-top:2px">${ip}</div>
        </div>
      </div>`
  }).join('')

  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Saffire — Generated Images</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#131315;color:#e2e2e5;font-family:Inter,sans-serif;padding:32px}h1{font-size:16px;font-weight:600;margin-bottom:6px}.sub{font-size:13px;color:#55555a;margin-bottom:28px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}.empty{color:#55555a;font-size:14px;padding:40px 0}</style>
</head><body>
  <h1>Saffire Freycinet — Generated Images</h1>
  <div class="sub">${rows.length} generation${rows.length !== 1 ? 's' : ''} · newest first</div>
  ${rows.length ? `<div class="grid">${cards}</div>` : '<div class="empty">No images generated yet.</div>'}
</body></html>`)
})

export default app
