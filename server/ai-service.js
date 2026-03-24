const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

const buildGeminiRequestBody = ({ systemPrompt, userPrompt, schema }) => ({
  generationConfig: {
    responseMimeType: 'application/json',
  },
  systemInstruction: {
    parts: [{ text: systemPrompt }],
  },
  contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
  ...(schema ? { tools: [{ functionDeclarations: [] }], responseSchema: schema } : {}),
})

const parseGeminiJson = (payload) => {
  const text =
    payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('') || ''

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function runStructuredAi({ mode, systemPrompt, userPrompt, fallbackFactory }) {
  if (!GEMINI_API_KEY) {
    return {
      ok: true,
      modelName: 'fallback-no-key',
      json: fallbackFactory(),
    }
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildGeminiRequestBody({
            systemPrompt,
            userPrompt: `${userPrompt}\n반드시 JSON만 반환하라. mode 필드는 '${mode}'로 고정한다.`,
          }),
        ),
      },
    )

    if (!res.ok) {
      const errorPayload = await res.json().catch(() => ({}))
      return {
        ok: false,
        error: 'ai_upstream_error',
        detail: errorPayload?.error?.message || res.statusText,
      }
    }

    const payload = await res.json()
    const json = parseGeminiJson(payload)

    if (!json || typeof json !== 'object') {
      return {
        ok: false,
        error: 'ai_parse_error',
      }
    }

    return {
      ok: true,
      modelName: GEMINI_MODEL,
      json,
    }
  } catch {
    return {
      ok: false,
      error: 'ai_request_failed',
    }
  }
}
