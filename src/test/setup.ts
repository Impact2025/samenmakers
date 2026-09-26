import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock Next.js server-only guard so modules using it can be tested
vi.mock("server-only", () => ({}));
