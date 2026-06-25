import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/competicoes/nova")({
  head: () => ({
    meta: [
      { title: "Cadastrar Competição — AquaFlow" },
      { name: "description", content: "Cadastro de novo evento de natação." },
    ],
  }),
  component: NovaCompeticao,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </Card>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NovaCompeticao() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Competição cadastrada com sucesso!");
    navigate({ to: "/competicoes" });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Cadastrar Competição"
        description="Cadastro de novo evento de natação."
        action={
          <Button asChild variant="ghost">
            <Link to="/competicoes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Dados do Evento">
          <Field label="Nome do Evento *" full>
            <Input placeholder="Ex.: Festival de Iniciantes de Natação" required />
          </Field>
          <Field label="Escopo *">
            <Select>
              <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="estadual">Estadual</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="nacional">Nacional</SelectItem>
                <SelectItem value="internacional">Internacional</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Campeonato">
            <Input placeholder="Vincular a um campeonato" />
          </Field>
          <Field label="Esporte">
            <Input defaultValue="Natação" readOnly />
          </Field>
          <Field label="Federação Organizadora *">
            <Input placeholder="Ex.: Federação Estadual" />
          </Field>
        </Section>

        <Section title="Etapas">
          <Field label="Número de Etapas *" full>
            <Input type="number" defaultValue={1} min={1} max={10} />
          </Field>
          <Field label="Descrição das Etapas" full>
            <Textarea rows={3} placeholder="Descreva as etapas da competição (ex: Etapa 1: Seletiva, Etapa 2: Final)..." />
          </Field>
        </Section>

        <Section title="Critério de Datas">
          <Field label="Início *">
            <Input type="date" required />
          </Field>
          <Field label="Término *">
            <Input type="date" required />
          </Field>
          <Field label="Limite de Inscrição *">
            <Input type="date" required />
          </Field>
          <Field label="Limite para Pagamento *">
            <Input type="date" required />
          </Field>
        </Section>

        <Section title="Local de Realização">
          <Field label="CEP">
            <Input placeholder="00000-000" />
          </Field>
          <Field label="Logradouro">
            <Input placeholder="Rua / Avenida" />
          </Field>
          <Field label="Número">
            <Input placeholder="Nº" />
          </Field>
          <Field label="Complemento">
            <Input placeholder="Complemento" />
          </Field>
          <Field label="Bairro">
            <Input placeholder="Bairro" />
          </Field>
          <Field label="Cidade">
            <Input placeholder="Cidade" />
          </Field>
          <Field label="UF">
            <Input placeholder="UF" maxLength={2} />
          </Field>
        </Section>

        <Section title="Piscina e Cronometragem">
          <Field label="Piscina *">
            <Select defaultValue="25">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 metros</SelectItem>
                <SelectItem value="50">50 metros</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Raias *">
            <Input type="number" defaultValue={8} min={4} max={10} />
          </Field>
          <Field label="Forma de Disputa *">
            <Select defaultValue="direta">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="direta">Final Direta</SelectItem>
                <SelectItem value="eliminatoria">Eliminatória + Final</SelectItem>
                <SelectItem value="semifinal">Eliminatória + Semi + Final</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Critério de Balizamento *">
            <Select defaultValue="tempo">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tempo">Por Tempo</SelectItem>
                <SelectItem value="faixa">Por Faixa Etária e Tempo (Master)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Sistema de Cronometragem *" full>
            <Select defaultValue="eletronica">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eletronica">Cronometragem Eletrônica</SelectItem>
                <SelectItem value="manual">Cronometragem Manual</SelectItem>
                <SelectItem value="mista">Sistema Misto</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Taxa">
          <Field label="Tipo de cobrança">
            <Select defaultValue="atleta">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="atleta">Por Atleta</SelectItem>
                <SelectItem value="inscricao">Por Inscrição (Provas)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Valor individual (R$)">
            <Input type="number" step="0.01" placeholder="0,00" />
          </Field>
          <Field label="Valor revezamento (R$)">
            <Input type="number" step="0.01" placeholder="0,00" />
          </Field>
          <Field label="Máx. provas por atleta">
            <Input type="number" placeholder="0" />
          </Field>
        </Section>

        <Section title="Observações Gerais">
          <Field label="Observações" full>
            <Textarea rows={4} placeholder="Informações adicionais sobre o evento..." />
          </Field>
        </Section>

        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/competicoes">Cancelar</Link>
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Cadastrar
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
