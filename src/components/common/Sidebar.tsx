"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Building2,
  FileText,
  Settings,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  orgTypes?: string[];
};

const navItems: NavItem[] = [
  {
    label: "Дашборд",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Мої замовлення",
    href: "/school/orders",
    icon: ShoppingCart,
    roles: ["employee"],
    orgTypes: ["school"],
  },
  {
    label: "Створити замовлення",
    href: "/school/orders/new",
    icon: UtensilsCrossed,
    roles: ["employee"],
    orgTypes: ["school"],
  },
  {
    label: "Вхідні замовлення",
    href: "/supplier/orders",
    icon: ShoppingCart,
    roles: ["employee"],
    orgTypes: ["supplier"],
  },
  {
    label: "Меню",
    href: "/school/menu",
    icon: UtensilsCrossed,
    roles: ["employee"],
    orgTypes: ["school"],
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
    label: "Управління меню",
    href: "/admin/menu",
    icon: UtensilsCrossed,
    roles: ["admin"],
  },
  {
    label: "Всі замовлення",
    href: "/admin/orders",
    icon: FileText,
    roles: ["admin"],
  },
  {
    label: "Налаштування",
    href: "/profile",
    icon: Settings,
  },
];

export default function Sidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    handleResize();
  }, [isOpen, pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (status === "loading") return null;

  const userRole = session?.user?.role as string | undefined;
  const orgType = session?.user?.organizationType as string | null;

  const getDashboardHref = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "employee" && orgType === "school")
      return "/school/dashboard";
    if (userRole === "employee" && orgType === "supplier")
      return "/supplier/dashboard";
    return "/dashboard";
  };

  const filteredItems = navItems
    .map((item) => {
      if (item.label === "Дашборд") {
        return { ...item, href: getDashboardHref() };
      }
      return item;
    })
    .filter((item) => {
      if (!item.roles && !item.orgTypes) return true;
      const roleMatch = !item.roles || item.roles.includes(userRole ?? "");
      const orgMatch = !item.orgTypes || item.orgTypes.includes(orgType ?? "");
      return roleMatch && orgMatch;
    });

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-white shadow-md"
        aria-label="Відкрити меню"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:relative md:z-auto"
        )}
      >
        <div className="p-6 border-b flex justify-between items-center md:block">
          <div>
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Шкільне харчування
            </Link>
            <p className="text-sm text-gray-500 mt-1">B2B платформа</p>
          </div>
          <button onClick={toggleSidebar} className="md:hidden">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut className="h-5 w-5" />
            Вийти
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}
