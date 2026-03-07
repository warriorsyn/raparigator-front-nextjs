import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClientSignupScreen() {
  return (
    <AuthShell title="Cadastro de cliente" description="Valide seus dados para contratar com rastreabilidade e suporte da Sigillus.">
      <form className="space-y-3">
        <Input id="cpf" label="CPF" placeholder="000.000.000-00" />
        <Input id="full-name" label="Nome completo" placeholder="Seu nome civil" />
        <Input id="email" label="E-mail" type="email" placeholder="voce@email.com" />
        <Input id="password" label="Senha" type="password" placeholder="Crie uma senha forte" />
        <Button fullWidth>Criar conta</Button>
      </form>
    </AuthShell>
  );
}
