import { notFound } from "next/navigation";
import { getSimulationById } from "@/lib/supabase";
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

  const sim = await getSimulationById(numericId);
  if (!sim) {
    notFound();
  }

  return <SimulationViewer sim={sim} />;
}
