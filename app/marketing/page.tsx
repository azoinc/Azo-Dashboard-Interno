import { DashboardView } from "@/components/dashboard/DashboardView";

export default function MarketingPage() {
  return (
    <DashboardView
      modo="acoes_marketing"
      titulo="Dashboard — Ação de Marketing"
      subtitulo="Leads provenientes de ações de marketing pagas e campanhas"
      accentColor="text-violet-400"
    />
  );
}
