import Sidebar from "@/components/Sidebar";
import { getSettings } from "@/lib/store";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen">
      <Sidebar company={settings.company} />
      <main className="flex-1 min-w-0">
        <div className="px-5 py-6 md:px-8 md:py-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
