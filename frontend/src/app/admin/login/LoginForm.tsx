"use client";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary w-full py-2.5 disabled:opacity-60">{pending ? "A entrar…" : "Entrar"}</button>;
}

export default function LoginForm() {
  const [state, action] = useFormState(login, null);
  return (
    <form action={action} className="space-y-4">
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
      <div><label className="label" htmlFor="password">Palavra-passe</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
      {state?.error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      <Submit />
    </form>
  );
}
