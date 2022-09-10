import { Connection } from "typeorm";
import request from "supertest";
import { app } from "@root/app";
import { createDatabaseConnection } from "@root/database";

describe("Create User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {});

  afterEach(async () => {});

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("creates an user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User",
      email: "user@test.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(201);
  });
});
