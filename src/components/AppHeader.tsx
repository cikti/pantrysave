import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";

const AppHeader = () => {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground" />
        <h1 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
          PantrySave
        </h1>
      </div>
      <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
        <Search size={18} className="text-foreground" />
      </button>
    </header>
  );
};

export default AppHeader;
