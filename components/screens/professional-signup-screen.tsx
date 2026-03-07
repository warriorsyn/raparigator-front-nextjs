import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ProfessionalSignupScreen() {
  return (
    <AuthShell title="Cadastro da profissional" description="Processo de verificacao para garantir seguranca e confianca da plataforma.">
      <form className="space-y-3">
        <Input id="cpf" label="CPF" placeholder="000.000.000-00" />
        <Input id="civil-name" label="Nome civil" placeholder="Seu nome civil" />
        <Input id="artistic-name" label="Nome artistico" placeholder="Nome de exibicao" />
        <Input id="phone" label="Telefone" placeholder="(11) 99999-9999" />
        <Input id="bank" label="Dados bancarios" placeholder="Banco, agencia e conta" />
        <Select id="identity" label="Reconhecimento facial / identidade" options={[{ value: "pending", label: "Enviar selfie + documento" }, { value: "started", label: "Verificacao iniciada" }]} />
        <Input id="features" label="Caracteristicas do perfil" placeholder="Altura, etnia, cor de cabelo, categoria" />
        <Input id="photos" label="Upload de fotos" type="file" multiple />
        <Input id="location" label="Localizacao de atendimento" placeholder="Cidade e bairro" />
        <Button fullWidth>Enviar para verificacao</Button>
      </form>
    </AuthShell>
  );
}
