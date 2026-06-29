export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(200,165,96,0.08),transparent_60%)]" />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
