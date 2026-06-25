import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/provas/nova")({
  head: () => ({
    meta: [
      { title: "Cadastrar Prova — AquaFlow" },
      { name: "description", content: "Cadastro de nova prova de natação." },
    ],
  }),
  component: NovaProva,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NovaProva() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Prova cadastrada com sucesso!");
    navigate({ to: "/provas" });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Cadastrar Prova"
        description="Defina estilo, distância, sexo, classe e forma de disputa."
        action={
          <Button asChild variant="ghost">
            <Link to="/provas">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Estilo *">
              <Select required>
                <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="livre">Livre</SelectItem>
                  <SelectItem value="costas">Costas</SelectItem>
                  <SelectItem value="peito">Peito</SelectItem>
                  <SelectItem value="borboleta">Borboleta</SelectItem>
                  <SelectItem value="medley">Medley</SelectItem>
                  <SelectItem value="revezamento">Revezamento</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Distância *">
              <Select required>
                <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25m</SelectItem>
                  <SelectItem value="50">50m</SelectItem>
                  <SelectItem value="100">100m</SelectItem>
                  <SelectItem value="200">200m</SelectItem>
                  <SelectItem value="400">400m</SelectItem>
                  <SelectItem value="800">800m</SelectItem>
                  <SelectItem value="1500">1500m</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sexo *">
              <Select required>
                <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="X">Misto</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Classe / Categoria *">
              <Input placeholder="Ex.: Pré-Mirim, Mirim, Petiz, Absoluto" required />
            </Field>
            <Field label="Forma de disputa *">
              <Select defaultValue="direta">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direta">Final Direta</SelectItem>
                  <SelectItem value="eliminatoria">Eliminatória + Final</SelectItem>
                  <SelectItem value="semifinal">Eliminatória + Semi + Final</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Número de raias">
              <Input type="number" defaultValue={8} min={4} max={10} />
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link to="/provas">Cancelar</Link>
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Cadastrar
            </Button>
          </div>
        </Card>
      </form>
    </AppLayout>
  );
}
