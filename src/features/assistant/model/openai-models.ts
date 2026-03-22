export const OPENAI_MODELS = [
  'gpt-5.4',
  'gpt-5.2',
  'gpt-5.1',
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
] as const

export type OpenAiModel = (typeof OPENAI_MODELS)[number]
