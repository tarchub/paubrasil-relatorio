"use client";

import { useActionState } from "react";
import Link from "next/link";
import { recoverPassword, type AuthState } from "../login/actions";

export default function RecoverPage() {
  const [state, formAction, pending] = useActionState<AuthState & { sent?: boolean }, FormData>(
    recoverPassword,
    {},
  );

  return (
    <div className="card p-6">
      {state.sent ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-sand">
            Se o e-mail existir, enviamos um link para redefinir a senha.
          </p>
          <Link href="/login" className="btn-ghost w-full">Voltar ao login</Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" required className="input"
              placeholder="voce@empresa.com" />
          </div>
          {state.error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Enviando…" : "Enviar link de recuperação"}
          </button>
          <Link href="/login" className="block text-center text-xs text-gold hover:underline">
            Voltar ao login
          </Link>
        </form>
      )}
    </div>
  );
}
