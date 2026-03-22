import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: false,
})

export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS finance_summary (
        id SERIAL PRIMARY KEY,
        balance VARCHAR(50) NOT NULL DEFAULT '0',
        upcoming_payments VARCHAR(50) NOT NULL DEFAULT '0',
        pending_count INTEGER NOT NULL DEFAULT 0,
        income_this_month VARCHAR(50) NOT NULL DEFAULT '0',
        expense_this_month VARCHAR(50) NOT NULL DEFAULT '0'
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS budget_items (
        id SERIAL PRIMARY KEY,
        label VARCHAR(100) NOT NULL,
        current_amount INTEGER NOT NULL DEFAULT 0,
        max_amount INTEGER NOT NULL DEFAULT 0,
        color VARCHAR(50) NOT NULL DEFAULT 'bg-blue-500'
      )
    `)

    const { rows: budgetCols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'budget_items' AND column_name = 'current'
    `)
    if (budgetCols.length > 0) {
      await client.query(`ALTER TABLE budget_items RENAME COLUMN "current" TO current_amount`)
      await client.query(`ALTER TABLE budget_items RENAME COLUMN "max" TO max_amount`)
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS timeline_items (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        time_str VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        date_str VARCHAR(20) NOT NULL,
        description TEXT,
        amount VARCHAR(50),
        category VARCHAR(100),
        location VARCHAR(255),
        related_event VARCHAR(255),
        preview TEXT,
        tags TEXT[]
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id SERIAL PRIMARY KEY,
        trigger_text TEXT NOT NULL,
        action_text TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true
      )
    `)

    const { rows: summaryRows } = await client.query('SELECT COUNT(*) FROM finance_summary')
    if (parseInt(summaryRows[0].count) === 0) {
      await client.query(`
        INSERT INTO finance_summary (balance, upcoming_payments, pending_count, income_this_month, expense_this_month)
        VALUES ('1,240,000', '135,000', 3, '3,500,000', '2,260,000')
      `)
    }

    const { rows: budgetRows } = await client.query('SELECT COUNT(*) FROM budget_items')
    if (parseInt(budgetRows[0].count) === 0) {
      await client.query(`
        INSERT INTO budget_items (label, current_amount, max_amount, color) VALUES
        ('운영비', 1500000, 2000000, 'bg-blue-500'),
        ('식비/회의비', 450000, 500000, 'bg-amber-500'),
        ('소프트웨어 구독', 120000, 200000, 'bg-cyan-500')
      `)
    }

    const { rows: timelineRows } = await client.query('SELECT COUNT(*) FROM timeline_items')
    if (parseInt(timelineRows[0].count) === 0) {
      await client.query(`
        INSERT INTO timeline_items (type, title, time_str, status, date_str, description) VALUES
        ('task', '주간 업무 보고서 작성', '10:00 - 11:30', 'completed', '2023-09-06', '노션 워크스페이스에 이번 주 지표 업데이트 완료')
      `)
      await client.query(`
        INSERT INTO timeline_items (type, title, time_str, status, date_str, amount, category, location, related_event) VALUES
        ('finance', '스타벅스 역삼점', '12:45', 'pending_category', '2023-09-06', '-9,500', '미분류', '서울 강남구 역삼동', '디자인 에이전시 미팅')
      `)
      await client.query(`
        INSERT INTO timeline_items (type, title, time_str, status, date_str, location, description) VALUES
        ('event', '디자인 에이전시 미팅', '14:00 - 15:00', 'upcoming', '2023-09-06', 'Zoom', '신규 앱 랜딩페이지 시안 검토 및 피드백 전달')
      `)
      await client.query(`
        INSERT INTO timeline_items (type, title, time_str, status, date_str, preview, tags) VALUES
        ('memo', '미팅 아이디어 스케치', '15:10', 'saved', '2023-09-06', '다음 주 런칭 프로모션 관련해서 유저 참여형 이벤트 위주로 구상할 것...', ARRAY['아이디어', '프로모션'])
      `)
      await client.query(`
        INSERT INTO timeline_items (type, title, time_str, status, date_str, amount, category, description) VALUES
        ('finance', '넷플릭스 정기결제', '18:00 예정', 'upcoming', '2023-09-06', '-17,000', '구독', '매월 6일 자동 결제')
      `)
      await client.query(`
        INSERT INTO timeline_items (type, title, time_str, status, date_str, preview, tags) VALUES
        ('memo', '세무사 제출 서류 목록', '어제', 'saved', '2023-09-05', E'1. 사업자등록증 사본\n2. 법인통장 내역 3개월치\n3. 부가세 신고 자료', ARRAY['세무', '중요'])
      `)
      await client.query(`
        INSERT INTO timeline_items (type, title, time_str, status, date_str, amount, category) VALUES
        ('finance', '위워크 임대료', '어제', 'completed', '2023-09-05', '-450,000', '운영비')
      `)
    }

    const { rows: autoRows } = await client.query('SELECT COUNT(*) FROM automation_rules')
    if (parseInt(autoRows[0].count) === 0) {
      await client.query(`
        INSERT INTO automation_rules (trigger_text, action_text, active) VALUES
        ('결제 내역 ''스타벅스'' 포함', '''회의비'' 태그 추천 및 일정 연동 대기', true),
        ('매월 25일 오전 9시', '급여 이체 리마인드 및 잔고 브리핑 생성', true),
        ('새 메모에 ''아이디어'' 태그 추가 시', '노션 ''아이디어 백로그'' DB로 자동 복사', false),
        ('예산 소진율 90% 초과 시', '지출 알림 강도 높임 (Red Status)', true)
      `)
    }

    console.log('✅ DB 초기화 완료')
  } finally {
    client.release()
  }
}
