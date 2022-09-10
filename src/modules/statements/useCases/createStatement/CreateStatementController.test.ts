import { app } from "@root/app";
import { createDatabaseConnection } from "@root/database";
import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

describe("Create Statement Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    await connection.runMigrations();
    const id = uuidv4();
    const password = await hash("123456", 8);
    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${id}', 'User', 'user@show.com', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to make a deposit", async () => {
    const loginResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@show.com",
      password: "123456",
    });

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .post(`/api/v1/statements/deposit`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 900,
        description: "Deposit",
      });
    const statement = response.body;

    expect(response.statusCode).toBe(201);
    expect(statement.type).toBe("deposit");
  });

  it("should be able to make a withdraw", async () => {
    const loginResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@show.com",
      password: "123456",
    });

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .post(`/api/v1/statements/withdraw`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 200,
        description: "Withdraw",
      });
    const statement = response.body;

    expect(response.statusCode).toBe(201);
    expect(statement.type).toBe("withdraw");
  });

  it("should not allow unauthenticated requests", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/deposit`)
      .send();

    expect(response.statusCode).toBe(401);

    const response2 = await request(app)
      .get(`/api/v1/statements/withdraw`)
      .send();

    expect(response2.statusCode).toBe(401);
  });
});
