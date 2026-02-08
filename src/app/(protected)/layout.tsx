import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Sidebar from "@/components/common/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-background overflow-x-hidden">
          <div className="container mx-auto p-4 md:p-6 max-w-[100vw]">{children}</div>
        </main>
      </div>
      <Footer />
      <Toaster richColors position="top-center" closeButton />
    </div>
  );
}
