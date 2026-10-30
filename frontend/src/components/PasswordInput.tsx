"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/** Campo de palavra-passe com botão "olhinho" para mostrar/esconder o texto. */
export default function PasswordInput({ className = "", ...rest }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...rest} type={show ? "text" : "password"} className={`field pr-10 ${className}`} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}
        aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"} title={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}