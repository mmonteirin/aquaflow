import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Calendar, MapPin, Waves, Settings2, Users, Trophy, FileText } from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { competitions, type Competition } from "@/lib/data";

export const Route = createFileRoute("/competicoes")({
  head: () => ({
    meta: [
      { title: "Competições — AquaFlow" },
      { name: "description", content: "Gerencie competições de natação: cadastro, status e detalhes." },
    ],
  }),
  component: Competicoes,
});

import { useRBAC } from "@/lib/rbac";

function Competicoes() {
  const { canManageCompetitions } = useRBAC();

  return (
    <AppLayout>
      <PageHeader
        title="Competições"
        description="Cadastro e gestão do ciclo completo das competições."
        action={
          canManageCompetitions && (
            <Button asChild>
              <Link to="/competicoes/nova">
                <Plus className="mr-2 h-4 w-4" /> Cadastrar Competição
              </Link>
            </Button>
          )
        }
      />
      <DataTable<Competition>
        rows={competitions}
        columns={[
          {
            header: "Competição",
            cell: (c) => (
              <div>
                <p className="font-medium">{c.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {c.sigla} · {c.tipo}
                </p>
              </div>
            ),
          },
          {
            header: "Período",
            cell: (c) => (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(c.dataInicio).toLocaleDateString("pt-BR")} –{" "}
                {new Date(c.dataFim).toLocaleDateString("pt-BR")}
              </span>
            ),
          },
          {
            header: "Local",
            cell: (c) => (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {c.cidade}/{c.estado}
              </span>
            ),
          },
          {
            header: "Piscina",
            cell: (c) => (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Waves className="h-3.5 w-3.5" />
                {c.piscina} · {c.raias} raias
              </span>
            ),
          },
          { header: "Atletas", cell: (c) => <span className="tabular-nums">{c.atletas}</span> },
          { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
          {
            header: "Ações",
            cell: (c) => (
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/competicoes/$id/provas" params={{ id: c.id }}>
                    <Trophy className="mr-1 h-3.5 w-3.5" /> Provas
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/inscricoes">
                    <Users className="mr-1 h-3.5 w-3.5" /> Inscrições
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link to="/competicoes/$id/gerenciar" params={{ id: c.id }}>
                    <Settings2 className="mr-1 h-3.5 w-3.5" /> Competição
                  </Link>
                </Button>
              </div>
            ),
          },
        ]}
      />
    </AppLayout>
  );
}
