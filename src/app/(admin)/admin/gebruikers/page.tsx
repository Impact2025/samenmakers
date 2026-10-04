import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { api } from "@/trpc/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fieldClasses } from "@/components/ui/field-styles";
import { UserActions } from "./user-actions";

export const metadata: Metadata = { title: "Admin — Gebruikers" };

const PAGE_SIZE = 25;

const STATUSSEN = [
  "active",
  "suspended",
  "banned",
  "pending_deletion",
] as const;
const ROLLEN = ["user", "admin"] as const;
const ABOS = ["none", "active", "past_due", "canceled"] as const;
const SORTERINGEN = [
  ["nieuwst", "Nieuwste eerst"],
  ["oudst", "Oudste eerst"],
  ["naam", "Naam A–Z"],
  ["email", "E-mail A–Z"],
] as const;

type Params = Record<string, string | string[] | undefined>;

function pick<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return allowed.find((a) => a === v);
}

function text(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const q = text(sp.q).trim();
  const status = pick(sp.status, STATUSSEN);
  const role = pick(sp.role, ROLLEN);
  const abo = pick(sp.abo, ABOS);
  const sector = text(sp.sector) || undefined;
  const sort =
    pick(
      sp.sort,
      SORTERINGEN.map(([v]) => v),
    ) ?? "nieuwst";
  const pagina = Math.max(1, Number.parseInt(text(sp.pagina), 10) || 1);

  const {
    items: users,
    total,
    sectors,
  } = await api.admin.users({
    limit: PAGE_SIZE,
    offset: (pagina - 1) * PAGE_SIZE,
    q: q || undefined,
    status,
    role,
    subscriptionStatus: abo,
    sector,
    sort,
  });

  const paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersActief = Boolean(q || status || role || abo || sector);

  function href(nieuwePagina: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (role) params.set("role", role);
    if (abo) params.set("abo", abo);
    if (sector) params.set("sector", sector);
    if (sort !== "nieuwst") params.set("sort", sort);
    if (nieuwePagina > 1) params.set("pagina", String(nieuwePagina));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  const select = `${fieldClasses} cursor-pointer`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface">Gebruikers</h1>
        <p className="text-secondary mt-1 text-sm">
          {filtersActief
            ? `${total} van de gebruikers gevonden`
            : `${total} gebruikers`}
        </p>
      </div>

      <form
        method="get"
        className="bg-surface-container-lowest shadow-card space-y-3 rounded-2xl p-4"
      >
        <div className="relative">
          <Search
            className="text-secondary pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Zoek op naam, e-mail, sector, regio of expertise"
            aria-label="Zoeken"
            className={`${fieldClasses} pl-11`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <select
            name="status"
            defaultValue={status ?? ""}
            className={select}
            aria-label="Status"
          >
            <option value="">Alle statussen</option>
            {STATUSSEN.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            name="role"
            defaultValue={role ?? ""}
            className={select}
            aria-label="Rol"
          >
            <option value="">Alle rollen</option>
            {ROLLEN.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            name="abo"
            defaultValue={abo ?? ""}
            className={select}
            aria-label="Abonnement"
          >
            <option value="">Alle abonnementen</option>
            {ABOS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            name="sector"
            defaultValue={sector ?? ""}
            className={select}
            aria-label="Sector"
          >
            <option value="">Alle sectoren</option>
            {sectors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className={select}
            aria-label="Sorteren"
          >
            {SORTERINGEN.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-primary-container text-on-primary-container rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Zoeken
          </button>
          {filtersActief && (
            <Link href="?" className="text-secondary text-sm hover:underline">
              Filters wissen
            </Link>
          )}
        </div>
      </form>

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
        {users.length === 0 && (
          <p className="text-secondary px-5 py-10 text-center text-sm">
            Geen gebruikers gevonden.
          </p>
        )}
      </div>

      {paginas > 1 && (
        <nav
          className="text-secondary flex items-center justify-between text-sm"
          aria-label="Paginering"
        >
          {pagina > 1 ? (
            <Link href={href(pagina - 1)} className="hover:underline">
              ← Vorige
            </Link>
          ) : (
            <span />
          )}
          <span>
            Pagina {pagina} van {paginas}
          </span>
          {pagina < paginas ? (
            <Link href={href(pagina + 1)} className="hover:underline">
              Volgende →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
