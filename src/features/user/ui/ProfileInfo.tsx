import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserInfo } from "../model/types";

type Props = {
  user: UserInfo;
};

export default function ProfileInfo({ user }: Props) {
  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <Avatar className="h-40 w-40">
          <AvatarImage
            src={user.avatarUrl ?? undefined}
            alt={user.firstName || "Користувач"}
          />
          <AvatarFallback>{user.firstName?.[0] || "M"}</AvatarFallback>
        </Avatar>
      </div>
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
          <dd className="text-base font-medium">{user.email}</dd>
        </div>

        {(user.firstName || user.lastName) && (
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Повне ім&apos;я
            </dt>
            <dd className="text-base font-medium">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
            </dd>
          </div>
        )}

        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">Роль</dt>
          <dd className="text-base font-medium capitalize">
            {user.role === "admin" ? "Адміністратор" : "Співробітник"}
          </dd>
        </div>

        {user.organization && (
          <>
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">
                Тип організації
              </dt>
              <dd className="text-base font-medium">
                {user.organization.type === "school" ? "Школа" : "Постачальник"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">
                Назва організації
              </dt>
              <dd className="text-base font-medium">
                {user.organization.name}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">
                Контакти організації
              </dt>
              <dd className="text-base font-medium">
                {user.organization.contactEmail}
              </dd>
              <dd className="text-base font-medium">
                {user.organization.contactPhone}
              </dd>
            </div>
          </>
        )}
      </dl>
    </>
  );
}
