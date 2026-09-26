import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";

export const metadata: Metadata = { title: "Admin — Gebruikers" };

export default async function AdminUsersPage() {
  const users = await api.admin.users({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface">Gebruikers</h1>
        <p className="text-secondary mt-1 text-sm">{users.length} gebruikers</p>
      </div>

      <div className="bg-surface-container-lowest shadow-card rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="hairline-b">
              <th className="text-label-md text-secondary px-5 py-3 text-left font-semibold">
                Gebruiker
              </th>
              <th className="text-label-md text-secondary px-5 py-3 text-left font-semibold">
                Email
              </th>
              <th className="text-label-md text-secondary px-5 py-3 text-left font-semibold">
                Status
              </th>
              <th className="text-label-md text-secondary px-5 py-3 text-left font-semibold">
                Rol
              </th>
              <th className="text-label-md text-secondary px-5 py-3 text-left font-semibold">
                Abo
              </th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-hairline divide-y">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatarUrl}
                      naam={user.naam ?? user.name ?? "?"}
                      size="xs"
                      grayscale={false}
                    />
                    <div>
                      <p className="text-on-surface font-semibold">
                        {user.naam ?? user.name}
                      </p>
                      <p className="text-secondary text-label-sm">
                        {user.sector ?? "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-secondary px-5 py-3">{user.email}</td>
                <td className="px-5 py-3">
                  <Badge
                    variant={user.status === "active" ? "primary" : "default"}
                    size="sm"
                  >
                    {user.status}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="default" size="sm">
                    {user.role}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant={
                      user.subscriptionStatus === "active"
                        ? "primary"
                        : "default"
                    }
                    size="sm"
                  >
                    {user.subscriptionStatus}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <UserActions
                    userId={user.id}
                    currentStatus={user.status}
                    currentRole={user.role}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
