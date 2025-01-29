import { app } from "@/app"; // Using path alias
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /", () => {
  it("should return 200 and correct data", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});
