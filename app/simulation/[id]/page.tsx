import { notFound } from "next/navigation";
import { getSimulation } from "@/lib/supabase";
import SimulationViewer from "./SimulationViewer";

export const dynamic = "force-dynamic";

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    notFound();
  }

  const sim = await getSimulation(numericId);
  if (!sim) {
    notFound();
  }

  return <SimulationViewer sim={sim} />;
}
