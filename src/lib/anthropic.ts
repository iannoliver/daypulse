import type { Checkin } from '../types'

export async function generateWeeklyInsight(checkins: Checkin[]): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string

  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY não configurada no .env')
  }

  const summary = checkins
    .map((c) => {
      const symptoms = c.physical.length > 0 ? c.physical.join(', ') : 'nenhum'
      const note = c.note ? `Nota: "${c.note}"` : 'Sem nota'
      return `Data: ${c.date} | Humor: ${c.mood}/5 | Energia: ${c.energy}/5 | Sono: ${c.sleep_hours}h | Sintomas: ${symptoms} | ${note}`
    })
    .join('\n')

  const userPrompt = `Aqui estão os dados de bem-estar da semana:\n\n${summary}\n\nGere um insight personalizado e empático sobre esses dados.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system:
        'Você é um assistente de bem-estar empático e objetivo. Analise os dados de bem-estar da semana e gere um insight personalizado em português. Seja direto, positivo e identifique padrões reais. Máximo 3 parágrafos.',
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro na API Anthropic: ${response.status} — ${error}`)
  }

  const data = await response.json()
  const content = data.content?.[0]

  if (content?.type !== 'text') {
    throw new Error('Resposta inesperada da API Anthropic')
  }

  return content.text as string
}
