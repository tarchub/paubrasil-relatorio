"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type AuthState } from "./actions";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card p-6 text-center text-sm text-sand-muted">Carregando…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});

  return (
    <div className="card p-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required
            className="input" placeholder="voce@empresa.com" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Senha</label>
            <Link href="/recuperar-senha" className="mb-1.5 text-xs text-gold hover:underline">
              Recuperar senha
            </Link>
          </div>
          <input id="password" name="password" type="password" autoComplete="current-password"
            required className="input" placeholder="••••••••" />
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-sand-muted">
        Plataforma privada. Acesso restrito ao proprietário.
      </p>
    </div>
  );
}
