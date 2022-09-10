import { app } from "@root/app";
import { createDatabaseConnection } from "@root/database";
import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

describe("Show User Profile", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    await connection.runMigrations();
    const id = uuidv4({
      random: [
        0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1,
        0x67, 0x1c, 0x58, 0x36,
      ],
    });
    const password = await hash("123456", 8);
    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${id}', 'User', 'user@show.com', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should return the user profile", async () => {
    const loginResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@show.com",
      password: "123456",
    });

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`)
      .send();
    const user = response.body;

    expect(response.statusCode).toBe(200);
    expect(user.id).toBeDefined();
    expect(user.email).toBe("user@show.com");
    expect(user.created_at).toBeDefined();
  });

  it("should not return the user if the user is not authenticated", async () => {
    const response = await request(app).get("/api/v1/profile").send();

    expect(response.statusCode).toBe(401);
  });
});
