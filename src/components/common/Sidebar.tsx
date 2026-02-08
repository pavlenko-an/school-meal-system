"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Building2,
  Settings,
  LogOut,
  PlusCircle,
  FileEdit,
  Package,
  CheckCircle,
  Tags,
  ListOrdered,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import useSidebarStore from "@/store/useSidebarStore";
import { useTransition } from "react";
import { createOrder } from "@/features/order/api/actions";
import { toast } from "sonner";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: ("employee" | "admin")[];
  orgTypes?: ("school" | "supplier" | null)[];
};

const navItems: NavItem[] = [
  {
    label: "Дашборд",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Меню",
    href: "/school/menu",
    icon: UtensilsCrossed,
    roles: ["employee"],
    orgTypes: ["school"],
  },
  {
    label: "Замовлення",
    href: "/school/orders",
    icon: ShoppingCart,
    roles: ["employee"],
    orgTypes: ["school"],
  },
  {
    label: "Чорновики",
    href: "/school/orders/drafts",
    icon: FileEdit,
    roles: ["employee"],
    orgTypes: ["school"],
  },
  {
    label: "Замовлення",
    href: "/supplier/orders",
    icon: Package,
    roles: ["employee"],
    orgTypes: ["supplier"],
  },
  {
    label: "Опубліковані",
    href: "/supplier/orders/published",
    icon: CheckCircle,
    roles: ["employee"],
    orgTypes: ["supplier"],
  },
  {
    label: "Організації",
    href: "/admin/organizations",
    icon: Building2,
    roles: ["admin"],
  },
  {
    label: "Користувачі",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Категорії",
    href: "/admin/categories",
    icon: Tags,
    roles: ["admin"],
  },
  {
    label: "Позиції меню",
    href: "/admin/menu-items",
    icon: ListOrdered,
    roles: ["admin"],
  },
  {
    label: "Всі замовлення",
    href: "/admin/orders",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    label: "Налаштування",
    href: "/profile",
    icon: Settings,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const pathname = usePathname();
  const open = useSidebarStore((s) => s.open);
  const setOpen = useSidebarStore((s) => s.setOpen);
  const [isCreating, startCreate] = useTransition();

  const userRole = session?.user?.role as "employee" | "admin";
  const orgType = session?.user?.organizationType as
    | "school"
    | "supplier"
    | null;

  const canCreateOrder = userRole === "employee" && orgType === "school";

  const getDashboardHref = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "employee" && orgType === "school")
      return "/school/dashboard";
    if (userRole === "employee" && orgType === "supplier")
      return "/supplier/dashboard";
    return "/dashboard";
  };

  const visibleItems = navItems
    .map((item) =>
      item.label === "Дашборд" ? { ...item, href: getDashboardHref() } : item,
    )
    .filter((item) => {
      if (!item.roles && !item.orgTypes) return true;
      const roleMatch = !item.roles || item.roles.includes(userRole);
      const orgMatch = !item.orgTypes || item.orgTypes.includes(orgType);
      return roleMatch && orgMatch;
    });

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleCreateOrder = () => {
    startCreate(async () => {
      const result = await createOrder();
      if (result?.success && result.data) {
        router.push(`/school/orders/${result.data.id}/edit`);
        router.refresh();
      } else if (!result?.success) {
        toast.error(result?.error ?? "Не вдалося створити замовлення");
      }
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={session?.user?.image ?? undefined}
                  alt={session?.user?.name ?? ""}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-left">
                  {session?.user?.name || "Користувач"}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1 pb-2">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-2 py-2 border-y">
              {canCreateOrder && (
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpen(false);
                    handleCreateOrder();
                  }}
                  disabled={isCreating}
                >
                  <PlusCircle className="mr-3 h-5 w-5" />
                  {isCreating ? "Створюємо..." : "Створити замовлення"}
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/auth/login" });
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Вийти
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "hidden md:block w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:relative md:z-auto",
        )}
      >
        <div className="p-6 border-b flex justify-between items-center md:block">
          <div>
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Шкільне харчування
            </Link>
            <p className="text-sm text-gray-500 mt-1">B2B платформа</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {canCreateOrder && (
          <div className="p-4 border-t">
            <Button
              variant="default"
              className="w-full justify-start"
              onClick={handleCreateOrder}
              disabled={isCreating}
            >
              <PlusCircle className="mr-3 h-5 w-5" />
              {isCreating ? "Створюємо..." : "Створити замовлення"}
            </Button>
          </div>
        )}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/80"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Вийти
          </Button>
        </div>
      </aside>
    </>
  );
}
