import { Parties } from "@/pages/Parties";

interface PartyReportProps {
  onBack: () => void;
}

export function PartyReport({ onBack }: PartyReportProps) {
  return <Parties isReportView={true} onBack={onBack} />;
}
