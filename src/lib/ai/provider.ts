import "server-only";
import type AnthropicNS from "@anthropic-ai/sdk";
import { getServerEnv } from "@/lib/env";

/**
 * Camada de IA plugável. Padrão: Anthropic Claude. Alternativa: OpenAI.
 * A chave vive apenas no servidor. Troque de provedor via AI_PROVIDER no .env.
 */

export type ChatResult = {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export type ChatOptions = {
  system: string;
  user: string;
  /** Pede resposta em JSON (usa response_format/prefill quando disponível). */
  json?: boolean;
  maxTokens?: number;
};

export function isAiConfigured(): boolean {
  const env = getServerEnv();
  if (env.AI_PROVIDER === "anthropic") return Boolean(env.ANTHROPIC_API_KEY);
  return Boolean(env.OPENAI_API_KEY);
}

export async function chat(opts: ChatOptions): Promise<ChatResult> {
  const env = getServerEnv();
  const maxTokens = opts.maxTokens ?? 2000;

  if (env.AI_PROVIDER === "anthropic") {
    // TODO(cred): defina ANTHROPIC_API_KEY no .env.local / Vercel.
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY ausente.");
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const messages: AnthropicNS.MessageParam[] = [
      { role: "user", content: opts.user },
    ];
    // Prefill para forçar JSON limpo.
    if (opts.json) messages.push({ role: "assistant", content: "{" });

    const res = await client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system: opts.system,
      messages,
    });

    const raw = res.content
      .filter((b): b is AnthropicNS.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const text = opts.json ? "{" + raw : raw;

    return {
      text,
      model: env.ANTHROPIC_MODEL,
      inputTokens: res.usage.input_tokens,
      outputTokens: res.usage.output_tokens,
    };
  }

  // OpenAI
  // TODO(cred): defina OPENAI_API_KEY no .env.local / Vercel.
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY ausente.");
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const res = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
  });

  return {
    text: res.choices[0]?.message?.content ?? "",
    model: env.OPENAI_MODEL,
    inputTokens: res.usage?.prompt_tokens ?? 0,
    outputTokens: res.usage?.completion_tokens ?? 0,
  };
}

/** Extrai JSON de uma resposta do LLM de forma tolerante. */
export function parseJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Resposta sem JSON válido.");
  return JSON.parse(text.slice(start, end + 1)) as T;
}
