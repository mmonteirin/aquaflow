import { createFileRoute, Link } from "@tanstack/react-router";
import { Waves, Plus } from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { events } from "@/lib/data";

export const Route = createFileRoute("/provas")({
  head: () => ({
    meta: [
      { title: "Provas — AquaFlow" },
      { name: "description", content: "Catálogo de provas por estilo: livre, costas, peito, borboleta, medley e revezamentos." },
    ],
  }),
  component: Provas,
});

function Provas() {
  return (
    <AppLayout>
      <PageHeader
        title="Provas"
        description="Catálogo de provas por estilo e distância."
        action={
          <Button asChild>
            <Link to="/provas/nova">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Prova
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Card key={e.estilo} className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Waves style={{ width: 18, height: 18 }} />
              </div>
              <h3 className="font-semibold">{e.estilo}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {e.distancias.map((d) => (
                <Badge key={d} variant="secondary">
                  {d}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
