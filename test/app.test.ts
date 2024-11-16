import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("GET /", () => {
  it("should log the message and return a 200 response with the correct data", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: "Hello, world!" });
  });
});
