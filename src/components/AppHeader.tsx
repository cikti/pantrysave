import { SidebarTrigger } from "@/components/ui/sidebar";
import UserAvatar from "@/components/UserAvatar";

const AppHeader = () => {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground" />
        <h1 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
          PantrySave
        </h1>
      </div>
      <UserAvatar size="sm" />
    </header>
  );
};

export default AppHeader;
