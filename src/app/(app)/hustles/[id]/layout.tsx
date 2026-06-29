import { redirect } from "next/navigation";
import { hustleService } from "@/services/hustle-service";
import { HustleHeader } from "./hustle-header";
import { HustleSubnav } from "./hustle-subnav";

export default async function HustleLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const hustle = await hustleService.getById(id);
  if (!hustle) redirect("/hustles");

  return (
    <div className="flex flex-col min-h-screen">
      <HustleHeader hustle={hustle} />
      <HustleSubnav hustleId={hustle.id} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
