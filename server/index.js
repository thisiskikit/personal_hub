import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pool, initDb } from './db.js'

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

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
    const items = rows.map((r) => {
      const base = { id: r.id, type: r.type, title: r.title, time: r.time_str, status: r.status, date: r.date_str }
      if (r.type === 'task') return { ...base, desc: r.description }
      if (r.type === 'finance') return { ...base, amount: r.amount, category: r.category, location: r.location, relatedEvent: r.related_event, desc: r.description }
      if (r.type === 'event') return { ...base, location: r.location, desc: r.description }
      if (r.type === 'memo') return { ...base, preview: r.preview, tags: r.tags || [] }
      return base
    })
    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/automation-rules', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM automation_rules ORDER BY id')
    res.json(rows.map((r) => ({ id: r.id, trigger: r.trigger_text, action: r.action_text, active: r.active })))
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
    res.json({ id: r.id, trigger: r.trigger_text, action: r.action_text, active: r.active })
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
