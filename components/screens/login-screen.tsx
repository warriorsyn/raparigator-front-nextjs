import Link from "next/link";
import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginScreen() {
  return (
    <AuthShell title="Entrar com seguranca" description="Acesse sua conta e acompanhe todas as etapas dentro da plataforma.">
      <form className="space-y-3">
        <Input id="email" label="E-mail" type="email" placeholder="voce@email.com" />
        <Input id="password" label="Senha" type="password" placeholder="********" />
        <Button fullWidth>Entrar</Button>
      </form>
      <div className="mt-4 space-y-1 text-sm">
        <p>Novo cliente? <Link href="/auth/cadastro/cliente" className="font-medium text-wine-700">Criar cadastro</Link></p>
        <p>Profissional? <Link href="/auth/cadastro/profissional" className="font-medium text-wine-700">Cadastrar perfil</Link></p>
      </div>
    </AuthShell>
  );
}
