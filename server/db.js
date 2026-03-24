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

    const ensureColumn = async (table, column, definition) => {
      const { rows } = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
        [table, column],
      )
      if (rows.length === 0) {
        await client.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
      }
    }

    await ensureColumn('automation_rules', 'condition_text', 'TEXT')
    await ensureColumn('automation_rules', 'category', "VARCHAR(80) NOT NULL DEFAULT '운영'")
    await ensureColumn('automation_rules', 'status', "VARCHAR(20) NOT NULL DEFAULT 'live'")
    await ensureColumn('automation_rules', 'approval_required', 'BOOLEAN NOT NULL DEFAULT true')
    await ensureColumn('automation_rules', 'created_by', "VARCHAR(40) NOT NULL DEFAULT 'ai'")

    await client.query(`
      CREATE TABLE IF NOT EXISTS prompt_profiles (
        id SERIAL PRIMARY KEY,
        key VARCHAR(120) UNIQUE NOT NULL,
        label VARCHAR(120) NOT NULL,
        prompt_text TEXT NOT NULL,
        is_system BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_runs (
        id SERIAL PRIMARY KEY,
        mode VARCHAR(60) NOT NULL,
        source_type VARCHAR(60),
        source_id VARCHAR(80),
        user_input TEXT,
        prompt_payload_json JSONB,
        model_name VARCHAR(120),
        response_json JSONB,
        confidence NUMERIC(5,2),
        approval_required BOOLEAN,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
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
        INSERT INTO automation_rules (trigger_text, condition_text, action_text, category, status, approval_required, created_by, active) VALUES
        ('결제 내역 ''스타벅스'' 포함', '거래 제목에 스타벅스 키워드가 포함', '''회의비'' 태그 추천 및 일정 연동 대기', '재무', 'live', true, 'ai', true),
        ('매월 25일 오전 9시', '매월 25일 09:00 스케줄 트리거', '급여 이체 리마인드 및 잔고 브리핑 생성', '운영', 'live', true, 'ai', true),
        ('새 메모에 ''아이디어'' 태그 추가 시', '메모 태그에 아이디어 포함', '노션 ''아이디어 백로그'' DB로 자동 복사', '지식관리', 'draft', true, 'ai', false),
        ('예산 소진율 90% 초과 시', '카테고리별 예산 소진율이 90% 초과', '지출 알림 강도 높임 (Red Status)', '재무', 'live', true, 'ai', true)
      `)
    }

    const { rows: promptRows } = await client.query('SELECT COUNT(*) FROM prompt_profiles')
    if (parseInt(promptRows[0].count) === 0) {
      await client.query(`
        INSERT INTO prompt_profiles (key, label, prompt_text, is_system) VALUES
        ('global_system_prompt', '전역 시스템 프롬프트', '당신은 운영 허브의 AI 운영 비서다. 답변은 한국어로 간결하게 작성하고 JSON 계약을 반드시 준수한다. 위험 가능성이 있는 작업은 approval_required=true로 표시한다.', true),
        ('inbox_parse_prompt', '인박스 파싱 프롬프트', '사용자 자연어를 일정/거래/메모/할 일 후보로 분류하고 핵심 엔티티를 추출한다. 불확실하면 clarification_needed=true로 설정한다.', false),
        ('item_analysis_prompt', '항목 분석 프롬프트', '선택된 항목의 의미를 운영 관점에서 해석하고 실행 가능한 다음 액션을 제시한다. 분류 변경/자동화 생성은 승인 필요 여부를 평가한다.', false),
        ('automation_rule_prompt', '자동화 규칙 프롬프트', '자연어 요청으로부터 IF/조건/THEN 규칙 초안을 생성한다. 리스크가 있으면 approval_required=true와 risk_level=high를 반환한다.', false),
        ('dashboard_briefing_prompt', '대시보드 브리핑 프롬프트', '오늘의 운영 상태를 1줄 헤드라인과 2~4개 불릿으로 요약한다. 실행 우선순위를 priority_score로 제시한다.', false)
      `)
    }

    console.log('✅ DB 초기화 완료')
  } finally {
    client.release()
  }
}
