import 'dotenv/config'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { SYSTEM_PROMPT } from './src/prompts/systemPrompt.js'
import { buildImagePrompt } from './src/prompts/buildUserPrompt.js'

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

// Step 1 prompt: ask the vision model to produce a scene inventory + transformation brief
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

app.get('/api/ping', (req, res) => res.json({ ok: true }))

// 20 conversions per IP per 24 hours
const convertLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Daily limit reached (20 conversions per 24 hours). Please try again tomorrow.' },
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
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
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
    const imagePart = imageData?.candidates?.[0]?.content?.parts
      ?.find(p => p.inlineData?.data)

    if (!imagePart) {
      const candidate = imageData?.candidates?.[0]
      const finishReason = candidate?.finishReason
      const textPart = candidate?.content?.parts?.find(p => p.text)?.text
      console.error('No image in response:', JSON.stringify({ finishReason, textPart, promptFeedback: imageData?.promptFeedback }, null, 2))
      return res.status(500).json({
        error: `Gemini returned no image. Reason: ${finishReason || 'unknown'}${textPart ? ` — "${textPart.slice(0, 120)}"` : ''}`,
      })
    }

    res.json({ imageBase64: imagePart.inlineData.data })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unexpected server error' })
  }
})

const PORT = process.env.SERVER_PORT || 3002
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`))
