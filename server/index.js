import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool, initDb } from './db.js'
import { runStructuredAi } from './ai-service.js'

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

const parseNumberConfidence = (value, fallback = 0.5) => {
  const numberValue = Number(value)
  if (Number.isFinite(numberValue)) return Math.max(0, Math.min(1, numberValue))
  return fallback
}

const mapTimelineRow = (r) => {
  const base = { id: r.id, type: r.type, title: r.title, time: r.time_str, status: r.status, date: r.date_str }
  if (r.type === 'task') return { ...base, desc: r.description }
  if (r.type === 'finance') return { ...base, amount: r.amount, category: r.category, location: r.location, relatedEvent: r.related_event, desc: r.description }
  if (r.type === 'event') return { ...base, location: r.location, desc: r.description }
  if (r.type === 'memo') return { ...base, preview: r.preview, tags: r.tags || [] }
  return base
}

const getPromptMap = async () => {
  const { rows } = await pool.query('SELECT key, prompt_text FROM prompt_profiles')
  return rows.reduce((acc, row) => {
    acc[row.key] = row.prompt_text
    return acc
  }, {})
}

const logAiRun = async ({ mode, sourceType, sourceId, userInput, promptPayload, modelName, responseJson, confidence, approvalRequired }) => {
  await pool.query(
    `INSERT INTO ai_runs (mode, source_type, source_id, user_input, prompt_payload_json, model_name, response_json, confidence, approval_required)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      mode,
      sourceType ?? null,
      sourceId ?? null,
      userInput ?? null,
      promptPayload ?? null,
      modelName ?? null,
      responseJson ?? null,
      confidence ?? null,
      approvalRequired ?? null,
    ],
  )
}

app.get('/api/dashboard-summary', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM finance_summary LIMIT 1')
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    const row = rows[0]
    res.json({
      balance: row.balance,
      upcomingPayments: row.upcoming_payments,
      pendingCount: row.pending_count,
      incomeThisMonth: row.income_this_month,
      expenseThisMonth: row.expense_this_month,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/finance-budget', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM budget_items ORDER BY id')
    res.json(
      rows.map((r) => ({
        label: r.label,
        current: r.current_amount,
        max: r.max_amount,
        color: r.color,
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/timeline', async (req, res) => {
  try {
    const { type } = req.query
    let query = 'SELECT * FROM timeline_items ORDER BY id'
    const params = []
    if (type && type !== 'all') {
      query = 'SELECT * FROM timeline_items WHERE type = $1 ORDER BY id'
      params.push(type)
    }
    const { rows } = await pool.query(query, params)
    const items = rows.map(mapTimelineRow)
    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/automation-rules', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM automation_rules ORDER BY id')
    res.json(rows.map((r) => ({
      id: r.id,
      trigger: r.trigger_text,
      conditionText: r.condition_text,
      action: r.action_text,
      category: r.category,
      status: r.status,
      approvalRequired: r.approval_required,
      createdBy: r.created_by,
      active: r.active,
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/automation-rules', async (req, res) => {
  try {
    const {
      trigger,
      conditionText,
      action,
      category = '운영',
      status = 'draft',
      approvalRequired = true,
      active = false,
    } = req.body
    if (!trigger || !action) {
      return res.status(400).json({ error: 'trigger/action required' })
    }
    const { rows } = await pool.query(
      `INSERT INTO automation_rules (trigger_text, condition_text, action_text, category, status, approval_required, created_by, active)
       VALUES ($1,$2,$3,$4,$5,$6,'ai',$7) RETURNING *`,
      [trigger, conditionText || null, action, category, status, approvalRequired, active],
    )
    const r = rows[0]
    res.status(201).json({
      id: r.id,
      trigger: r.trigger_text,
      conditionText: r.condition_text,
      action: r.action_text,
      category: r.category,
      status: r.status,
      approvalRequired: r.approval_required,
      createdBy: r.created_by,
      active: r.active,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/timeline/:id/category', async (req, res) => {
  try {
    const { id } = req.params
    const { category } = req.body
    const { rows } = await pool.query(
      `UPDATE timeline_items SET category = $1, status = CASE WHEN status = 'pending_category' THEN 'completed' ELSE status END WHERE id = $2 AND type = 'finance' RETURNING *`,
      [category, id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    const r = rows[0]
    if (r.status === 'completed') {
      await pool.query(`UPDATE finance_summary SET pending_count = GREATEST(pending_count - 1, 0) WHERE id = 1`)
    }
    res.json({ id: r.id, type: r.type, title: r.title, time: r.time_str, status: r.status, date: r.date_str, amount: r.amount, category: r.category, location: r.location, relatedEvent: r.related_event, desc: r.description })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/automation-rules/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const { active } = req.body
    const { rows } = await pool.query('UPDATE automation_rules SET active = $1 WHERE id = $2 RETURNING *', [active, id])
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    const r = rows[0]
    res.json({
      id: r.id,
      trigger: r.trigger_text,
      conditionText: r.condition_text,
      action: r.action_text,
      category: r.category,
      status: r.status,
      approvalRequired: r.approval_required,
      createdBy: r.created_by,
      active: r.active,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/prompt-profiles', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prompt_profiles ORDER BY id')
    res.json(rows.map((row) => ({
      id: row.id,
      key: row.key,
      label: row.label,
      promptText: row.prompt_text,
      isSystem: row.is_system,
      updatedAt: row.updated_at,
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/prompt-profiles/:key', async (req, res) => {
  try {
    const { key } = req.params
    const { promptText } = req.body
    if (!promptText || typeof promptText !== 'string') {
      return res.status(400).json({ error: 'promptText required' })
    }
    const { rows } = await pool.query(
      `UPDATE prompt_profiles SET prompt_text = $1, updated_at = NOW() WHERE key = $2 RETURNING *`,
      [promptText, key],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    const row = rows[0]
    res.json({
      id: row.id,
      key: row.key,
      label: row.label,
      promptText: row.prompt_text,
      isSystem: row.is_system,
      updatedAt: row.updated_at,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/ai/inbox-parse', async (req, res) => {
  try {
    const { input, model } = req.body
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'input required' })
    }

    const prompts = await getPromptMap()
    const fallback = () => ({
      mode: 'inbox_parse',
      summary: '입력을 인박스 초안으로 분류했습니다.',
      primary_type: /(내일|오전|오후|\d+시|\d{1,2}:\d{2})/.test(input) ? 'event' : /(\d+[\d,]*(원|만원)?)/.test(input) ? 'finance' : 'memo',
      secondary_types: [],
      confidence: 0.62,
      clarification_needed: false,
      recommended_save_mode: /(내일|오전|오후|\d+시|\d{1,2}:\d{2})/.test(input) ? 'event' : 'inbox',
      entities: { title: input.trim(), datetime_text: null, amount_text: null, location: null, people: [], tags: [] },
      suggested_actions: ['저장 방식 선택', '필요시 제목 보정'],
    })

    const aiResult = await runStructuredAi({
      mode: 'inbox_parse',
      systemPrompt: `${prompts.global_system_prompt || ''}\n${prompts.inbox_parse_prompt || ''}`,
      userPrompt: `사용자 입력: ${input}`,
      fallbackFactory: fallback,
      modelOverride: model,
    })

    if (!aiResult.ok) {
      return res.status(200).json({ ok: false, error: aiResult.error, data: fallback() })
    }

    const data = {
      ...fallback(),
      ...aiResult.json,
      mode: 'inbox_parse',
      confidence: parseNumberConfidence(aiResult.json?.confidence, 0.6),
    }

    await logAiRun({
      mode: 'inbox_parse',
      sourceType: 'chat',
      sourceId: null,
      userInput: input,
      promptPayload: { input },
      modelName: aiResult.modelName,
      responseJson: data,
      confidence: data.confidence,
      approvalRequired: Boolean(data.approval_required),
    })

    res.json({ ok: true, data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/ai/analyze-item', async (req, res) => {
  try {
    const { itemId, model } = req.body
    if (!itemId) return res.status(400).json({ error: 'itemId required' })

    const { rows } = await pool.query('SELECT * FROM timeline_items WHERE id = $1 LIMIT 1', [itemId])
    if (!rows[0]) return res.status(404).json({ error: 'Item not found' })
    const item = mapTimelineRow(rows[0])
    const prompts = await getPromptMap()

    const fallback = () => ({
      mode: 'item_analysis',
      item_id: itemId,
      summary: '선택 항목을 운영 관점에서 분석했습니다.',
      best_interpretation: item.type === 'finance' ? '지출 분류 정리가 필요한 거래입니다.' : '후속 액션 후보가 있는 항목입니다.',
      alternative_interpretations: [],
      confidence: 0.67,
      approval_required: item.type === 'finance',
      suggested_actions: item.type === 'finance' ? ['회의비로 분류', '관련 메모 작성'] : ['관련 메모 작성'],
      rule_draft: null,
    })

    const aiResult = await runStructuredAi({
      mode: 'item_analysis',
      systemPrompt: `${prompts.global_system_prompt || ''}\n${prompts.item_analysis_prompt || ''}`,
      userPrompt: `항목 JSON: ${JSON.stringify(item)}`,
      fallbackFactory: fallback,
      modelOverride: model,
    })

    if (!aiResult.ok) {
      return res.status(200).json({ ok: false, error: aiResult.error, data: fallback() })
    }

    const data = {
      ...fallback(),
      ...aiResult.json,
      mode: 'item_analysis',
      item_id: itemId,
      confidence: parseNumberConfidence(aiResult.json?.confidence, 0.67),
    }

    await logAiRun({
      mode: 'item_analysis',
      sourceType: 'timeline_item',
      sourceId: String(itemId),
      userInput: null,
      promptPayload: { item },
      modelName: aiResult.modelName,
      responseJson: data,
      confidence: data.confidence,
      approvalRequired: Boolean(data.approval_required),
    })

    res.json({ ok: true, data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/ai/rule-draft', async (req, res) => {
  try {
    const { input, model } = req.body
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'input required' })
    }
    const prompts = await getPromptMap()
    const fallback = () => ({
      mode: 'rule_draft',
      human_summary: '입력 기반 자동화 규칙 초안을 생성했습니다.',
      trigger_text: input,
      condition_text: '입력 조건이 충족될 때',
      action_text: '알림 및 후속 작업 생성',
      category: '운영',
      approval_required: true,
      default_active: false,
      risk_level: 'medium',
    })

    const aiResult = await runStructuredAi({
      mode: 'rule_draft',
      systemPrompt: `${prompts.global_system_prompt || ''}\n${prompts.automation_rule_prompt || ''}`,
      userPrompt: `자동화 요청: ${input}`,
      fallbackFactory: fallback,
      modelOverride: model,
    })

    if (!aiResult.ok) {
      return res.status(200).json({ ok: false, error: aiResult.error, data: fallback() })
    }

    const data = {
      ...fallback(),
      ...aiResult.json,
      mode: 'rule_draft',
    }

    await logAiRun({
      mode: 'rule_draft',
      sourceType: 'automation',
      sourceId: null,
      userInput: input,
      promptPayload: { input },
      modelName: aiResult.modelName,
      responseJson: data,
      confidence: parseNumberConfidence(aiResult.json?.confidence, 0.62),
      approvalRequired: Boolean(data.approval_required),
    })

    res.json({ ok: true, data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/ai/dashboard-briefing', async (_req, res) => {
  try {
    const model = _req.query.model
    const prompts = await getPromptMap()
    const timelineRows = await pool.query('SELECT * FROM timeline_items ORDER BY id DESC LIMIT 6')
    const summaryRows = await pool.query('SELECT * FROM finance_summary LIMIT 1')
    const context = {
      summary: summaryRows.rows[0] || null,
      recentItems: timelineRows.rows.map(mapTimelineRow),
    }

    const fallback = () => ({
      mode: 'dashboard_briefing',
      headline: '오늘 처리 우선순위: 미분류 거래 정리와 일정 점검',
      bullets: ['미분류 거래를 먼저 분류하세요.', '오후 일정 전에 관련 메모를 업데이트하세요.'],
      priority_score: 74,
    })

    const aiResult = await runStructuredAi({
      mode: 'dashboard_briefing',
      systemPrompt: `${prompts.global_system_prompt || ''}\n${prompts.dashboard_briefing_prompt || ''}`,
      userPrompt: `운영 컨텍스트: ${JSON.stringify(context)}`,
      fallbackFactory: fallback,
      modelOverride: typeof model === 'string' ? model : undefined,
    })

    if (!aiResult.ok) {
      return res.status(200).json({ ok: false, error: aiResult.error, data: fallback() })
    }

    const data = {
      ...fallback(),
      ...aiResult.json,
      mode: 'dashboard_briefing',
    }

    await logAiRun({
      mode: 'dashboard_briefing',
      sourceType: 'dashboard',
      sourceId: null,
      userInput: null,
      promptPayload: context,
      modelName: aiResult.modelName,
      responseJson: data,
      confidence: parseNumberConfidence(aiResult.json?.confidence, 0.71),
      approvalRequired: false,
    })

    res.json({ ok: true, data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

initDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API 서버 실행 중: http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ DB 연결 실패:', err.message)
    process.exit(1)
  })
