/**
 * tRPC test utilities — creates server-side callers with mocked context.
 *
 * Usage:
 *   const caller = createTestCaller(mockDb, { role: 'admin' });
 *   const result = await caller.users.me();
 */

import { createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/root";

interface MockUserOverrides {
  id?: string;
  email?: string;
  role?: string;
  isPro?: boolean;
  name?: string;
}

export function createTestCaller(
  db: Record<string, any>,
  userOverrides: MockUserOverrides = {},
) {
  const createCaller = createCallerFactory(appRouter);

  const ctx = {
    db,
    session: {
      user: {
        id: userOverrides.id ?? "test-user-1",
        email: userOverrides.email ?? "test@example.com",
        role: userOverrides.role ?? "user",
        isPro: userOverrides.isPro ?? false,
        name: userOverrides.name ?? "Test User",
        // Extra fields expected by session user type at runtime
        naam: null as string | null,
        avatarUrl: null as string | null,
      } as any,
      expires: new Date(Date.now() + 3600_000).toISOString() as any,
    },
    req: new Request("http://localhost:3000"),
  } as any;

  return createCaller(ctx);
}

type Store = Record<string, any[]>;

function makeQueryApi(stores: Store) {
  const query: Record<string, { findFirst: Function; findMany: Function }> = {};

  for (const key of Object.keys(stores)) {
    query[key] = {
      findFirst: (_opts?: { where?: any }) => {
        const rows = stores[key] ?? [];
        return rows[0] ?? null;
      },
      findMany: (opts?: { where?: any; limit?: number }) => {
        let rows = stores[key] ?? [];
        if (opts?.limit && opts.limit < rows.length)
          rows = rows.slice(0, opts.limit);
        return rows;
      },
    };
  }

  return query;
}

function makeSelectApi(stores: Store) {
  return (_columns?: any) => ({
    from: (_table: any) => {
      // Return ALL rows from ALL stores — filtering/sorting not needed
      // for integration test purposes
      return {
        where: (_where?: any) => {
          const chain = {
            orderBy: (..._args: any[]) => ({
              limit: (n: number) => {
                const allRows = Object.values(stores).flat();
                return allRows.slice(0, n);
              },
            }),
            limit: (n: number) => {
              const allRows = Object.values(stores).flat();
              return allRows.slice(0, n);
            },
          };
          return chain;
        },
      };
    },
  });
}

function makeInsertApi(_stores: Store) {
  return (_table: any) => ({
    values: (vals: any) => ({
      onConflictDoNothing: async () => {
        return [];
      },
      returning: async () => [vals],
    }),
  });
}

function makeUpdateApi(_stores: Store) {
  return (_table: any) => ({
    set: (_vals: any) => ({
      where: async (_where?: any) => {},
    }),
  });
}

/**
 * Creates a minimal mock DB object that supports Drizzle's chained query API.
 * Accepts a `stores` map keyed by table name with arrays of row objects.
 *
 * NOTE: Filtering/sorting is NOT applied — rows are returned as-is from the store.
 * This is sufficient for integration testing procedure middleware, auth guards,
 * input validation, and data shape verification.
 */
export function createMockDb(stores: Store = {}) {
  return {
    _stores: stores,
    query: makeQueryApi(stores),
    select: makeSelectApi(stores),
    insert: makeInsertApi(stores),
    update: makeUpdateApi(stores),
  };
}
