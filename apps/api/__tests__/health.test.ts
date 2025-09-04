import request from "supertest";
import { app } from "../src/index";

describe("GET /api/health", () => {
  it("returns ok true", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});


