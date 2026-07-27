/**
 * Prompts base (versionados em código). Podem ser sobrescritos pela tabela
 * `ai_prompts` via painel administrativo. As categorias válidas são injetadas
 * dinamicamente a partir do banco.
 */

export const ANALYZE_SYSTEM = `Você é um analista sênior de inteligência de mercado especializado no mercado americano de marketing digital, funis, infoprodutos, SaaS, IA aplicada, growth e novos modelos de negócio. Seu trabalho é analisar um conteúdo publicado nos EUA e traduzir/adaptar as ideias para o mercado brasileiro.

Regras:
- Escreva em português do Brasil, claro e objetivo.
- Preserve termos técnicos consagrados em inglês quando fizer sentido (ex.: "upsell", "lead magnet", "churn").
- Seja concreto e prático, sem encher linguiça.
- Responda SEMPRE em JSON válido conforme o schema pedido. Nada além do JSON.`;

export function analyzeUserPrompt(input: {
  title: string;
  excerpt: string | null;
  source: string | null;
  url: string;
  categories: string[];
}): string {
  return `Categorias disponíveis (escolha o slug mais adequado): ${input.categories.join(", ")}.

Conteúdo:
- Título: ${input.title}
- Fonte: ${input.source ?? "desconhecida"}
- URL: ${input.url}
- Trecho/descrição: ${input.excerpt ?? "(não disponível — analise a partir do título)"}

Produza EXATAMENTE este JSON:
{
  "title_pt": "título traduzido para PT",
  "category_slug": "um dos slugs disponíveis",
  "summary_pt": "resumo executivo em 2-4 frases",
  "key_learnings": ["aprendizado 1", "aprendizado 2", "aprendizado 3"],
  "strategy": "estratégia identificada",
  "audience": "público envolvido",
  "monetization": "modelo de monetização",
  "tools": ["ferramenta 1", "ferramenta 2"],
  "funnel": "possível funil utilizado",
  "offer": "possível oferta utilizada",
  "companies": ["empresa 1", "empresa 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "novelty_score": 0-100,
  "br_potential_score": 0-100,
  "br": {
    "is_common": true/false,
    "maturity": "nível de maturidade no Brasil",
    "niches": ["nicho 1", "nicho 2"],
    "adaptation": "como adaptar ao Brasil",
    "difficulties": "dificuldades esperadas",
    "initial_investment": "investimento inicial aproximado (faixa em R$)",
    "product_type": "serviço | produto | SaaS | infoproduto",
    "mvp": "versão mínima para testar",
    "recurrence_potential": "potencial de recorrência",
    "execution_difficulty": "baixa | média | alta",
    "validation_speed": "rápida | média | lenta"
  },
  "opportunity_score": 0-100,
  "opportunity_breakdown": {
    "novidade_brasil": 0-100,
    "potencial_faturamento": 0-100,
    "facilidade_implementacao": 0-100,
    "potencial_recorrencia": 0-100,
    "demanda_provavel": 0-100,
    "competicao_existente": 0-100,
    "capacidade_adaptacao": 0-100
  }
}`;
}

export const BRIEFING_SYSTEM = `Você é o editor do "Radar diário do mercado americano". Resuma o que mudou nas últimas 24h de forma direta e acionável para um empreendedor brasileiro de marketing/produtos digitais. Português do Brasil. Responda em JSON válido.`;

export function briefingUserPrompt(items: Array<{
  title_pt: string | null;
  title: string;
  summary: string | null;
  category: string | null;
  br_potential: number | null;
}>): string {
  const list = items
    .map(
      (i, n) =>
        `${n + 1}. [${i.category ?? "-"} | BR:${i.br_potential ?? "-"}] ${i.title_pt ?? i.title} — ${i.summary ?? ""}`,
    )
    .join("\n");

  return `Conteúdos das últimas 24h:
${list}

Produza EXATAMENTE este JSON:
{
  "intro_pt": "parágrafo de abertura resumindo as principais mudanças das últimas 24h",
  "top_news": [{"title":"","why":"por que importa"}],  // até 5
  "trends": [{"name":"","note":""}],                    // até 3
  "saas": [{"name":"","note":""}],                      // até 3
  "strategies": [{"name":"","note":""}],                // até 2
  "top_opportunity": {"name":"","note":"por que tem alto potencial no Brasil"},
  "alerts": ["alerta 1"],
  "recommended": ["leitura recomendada 1", "leitura recomendada 2"]
}`;
}
