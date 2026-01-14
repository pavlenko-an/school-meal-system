import Sidebar from "@/components/ui/Sidebar";

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
