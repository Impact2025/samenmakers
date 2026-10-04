import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockDb, createTestCaller } from "@/test/trpc-test-utils";

// Hoisted holder for mutable db reference — vi.mock factories run once,
// so we use a getter to always read the current value.
const dbHolder = vi.hoisted(() => ({ value: null as any }));
const authHolder = vi.hoisted(() => ({
  value: {
    user: {
      id: "admin-1",
      email: "admin@test.com",
      role: "admin",
      isPro: true,
      name: "Admin",
    },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  },
}));

vi.mock("@/server/db", () => ({
  get db() {
    return dbHolder.value;
  },
}));

vi.mock("@/server/auth/config", () => ({
  auth: () => authHolder.value,
}));

vi.mock("@/lib/email", () => ({ sendMatchEmail: vi.fn() }));
vi.mock("@/lib/notify", () => ({ createNotification: vi.fn() }));
vi.mock("@/lib/ratelimit", () => ({
  checkSwipeLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 999, reset: 0 }),
}));

const BASE_USERS = [
  {
    id: "u1",
    naam: "Alice",
    email: "alice@test.com",
    password: "$2a$12$fakehashfakehashfakehash",
    stripeCustomerId: "cus_123",
    referralCode: "ALICE123",
    sector: "Social Impact",
    regio: "Amsterdam",
    fase: "starter",
    bio: "Impact maker",
    missie: "Better world",
    expertise: ["AI", "Duurzaamheid"],
    avatarUrl: "https://example.com/a.jpg",
    isFeatured: true,
    status: "active",
    role: "user",
    isPro: false,
    profileCompleteness: 85,
    mentorshipRole: "mentor",
    subscriptionStatus: "active",
    crmStage: "customer",
    crmTags: ["vip"],
    crmLastContactedAt: null,
    createdAt: new Date(),
  },
  {
    id: "u2",
    naam: "Bob",
    email: "bob@test.com",
    sector: "Circulaire Economie",
    regio: "Rotterdam",
    fase: "groei",
    bio: "Circulair",
    missie: "No waste",
    expertise: ["Recycling"],
    avatarUrl: null,
    isFeatured: false,
    status: "active",
    role: "user",
    isPro: true,
    profileCompleteness: 70,
    mentorshipRole: "mentee",
    subscriptionStatus: "none",
    crmStage: "lead",
    crmTags: [],
    crmLastContactedAt: null,
    createdAt: new Date(),
  },
  {
    id: "u3",
    naam: "Charlie",
    email: "charlie@test.com",
    sector: "Tech",
    regio: "Utrecht",
    fase: "scale",
    bio: null,
    missie: null,
    expertise: ["AI"],
    avatarUrl: null,
    isFeatured: false,
    status: "suspended",
    role: "user",
    isPro: false,
    profileCompleteness: 30,
    mentorshipRole: "none",
    subscriptionStatus: "canceled",
    crmStage: "churned",
    crmTags: ["ouder"],
    crmLastContactedAt: null,
    createdAt: new Date(),
  },
];

describe("users router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const m = createMockDb({ users: BASE_USERS, blockedUsers: [] });
    dbHolder.value = m;
    authHolder.value = {
      user: {
        id: "u1",
        email: "alice@test.com",
        role: "admin",
        isPro: true,
        name: "Alice",
      },
      expires: new Date(Date.now() + 3600_000).toISOString(),
    };
  });

  it("me returns the current user by ID", async () => {
    const caller = createTestCaller(dbHolder.value, {
      id: "u1",
      role: "admin",
    });
    const result = await caller.users.me();
    expect(result).not.toBeNull();
    expect(result?.naam).toBe("Alice");
  });

  it("completeness returns the profile score", async () => {
    const caller = createTestCaller(dbHolder.value, {
      id: "u1",
      role: "admin",
    });
    const score = await caller.users.completeness();
    expect(score).toBe(85);
  });

  it("byId returns a user", async () => {
    const caller = createTestCaller(dbHolder.value, {
      id: "u1",
      role: "admin",
    });
    const result = await caller.users.byId({ id: "u2" });
    expect(result).not.toBeNull();
    expect(result?.naam).toBeTruthy();
  });

  it("never leaks password hash, e-mail, Stripe or CRM fields of other members", async () => {
    const caller = createTestCaller(dbHolder.value, { id: "u1", role: "user" });
    for (const result of [
      await caller.users.byId({ id: "u2" }),
      await caller.users.byNaam({ naam: "Alice" }),
    ]) {
      expect(result).toBeTruthy();
      for (const key of [
        "password",
        "email",
        "stripeCustomerId",
        "subscriptionId",
        "crmStage",
        "crmTags",
        "referralCode",
        "role",
      ]) {
        expect(result).not.toHaveProperty(key);
      }
    }
  });

  it("byNaam returns a user (public)", async () => {
    const caller = createTestCaller(dbHolder.value, {
      id: "u1",
      role: "admin",
    });
    const result = await caller.users.byNaam({ naam: "Charlie" });
    expect(result).not.toBeNull();
    expect(result?.naam).toBeTruthy();
  });
});

describe("matches router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const m = createMockDb({ users: BASE_USERS, matches: [] });
    dbHolder.value = m;
    authHolder.value = {
      user: {
        id: "u1",
        role: "user",
        isPro: false,
        email: "alice@test.com",
        name: "Alice",
      },
      expires: "",
    };
  });

  it("myMatches returns empty array when no matches", async () => {
    const caller = createTestCaller(dbHolder.value, { id: "u1" });
    const result = await caller.matches.myMatches();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("CRM router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const m = createMockDb({ users: BASE_USERS, crmActivities: [] });
    dbHolder.value = m;
    authHolder.value = {
      user: {
        id: "admin-1",
        role: "admin",
        isPro: true,
        email: "admin@test.com",
        name: "Admin",
      },
      expires: "",
    };
  });

  it("contacts returns users (admin only)", async () => {
    // Verify the mock DB has data
    expect(dbHolder.value._stores.users.length).toBe(3);
    const caller = createTestCaller(dbHolder.value, {
      id: "admin-1",
      role: "admin",
    });
    const contacts = await caller.crm.contacts({ limit: 100 });
    expect(Array.isArray(contacts.items)).toBe(true);
    expect(contacts.items.length).toBeGreaterThanOrEqual(3);
  });

  it("contact returns detail for a specific user", async () => {
    const caller = createTestCaller(dbHolder.value, {
      id: "admin-1",
      role: "admin",
    });
    const result = await caller.crm.contact({ id: "u1" });
    expect(result).toBeDefined();
    expect(result.user?.naam).toBe("Alice");
  });
});

describe("coupons router", () => {
  const couponsData = [
    {
      id: "c1",
      code: "ZOMER25",
      discountType: "percent",
      discountValue: 25,
      duration: "once",
      active: true,
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      timesRedeemed: 0,
      stripeCouponId: "cp_1",
      stripePromotionCodeId: "promo_1",
      description: "Zomer deal",
      expiresAt: null,
      maxRedemptions: null,
      durationInMonths: null,
      currency: "eur",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const m = createMockDb({ coupons: couponsData });
    dbHolder.value = m;
    authHolder.value = {
      user: {
        id: "admin-1",
        role: "admin",
        isPro: true,
        email: "admin@test.com",
        name: "Admin",
      },
      expires: "",
    };
  });

  it("list returns all coupons (admin only)", async () => {
    const caller = createTestCaller(dbHolder.value, {
      id: "admin-1",
      role: "admin",
    });
    const list = await caller.coupons.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(1);
    expect(list[0]?.code).toBe("ZOMER25");
  });
});
