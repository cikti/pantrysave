import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen max-w-lg mx-auto relative">
        {children}
        <BottomNav />
        <ChatBox sellerName="Local Seller" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <ChatBox sellerName="Local Seller" />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
