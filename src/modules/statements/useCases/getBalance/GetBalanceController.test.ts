import { app } from "@root/app";
import { createDatabaseConnection } from "@root/database";
import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

describe("Get Balance Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    await connection.runMigrations();
    const id = uuidv4();
    const password = await hash("123456", 8);
    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${id}', 'User', 'user@show.com', '${password}')`
    );

    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, type) VALUES ('${uuidv4()}', '${id}', 'Deposit', 900.00, 'deposit')`
    );
    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, type) VALUES ('${uuidv4()}', '${id}', 'Withdraw', 200.00, 'withdraw')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should return the current user balance + the statement", async () => {
    const loginResponse = await request(app).post("/api/v1/sessions").send({
      email: "user@show.com",
      password: "123456",
    });

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${token}`)
      .send();
    const { statement, balance } = response.body;

    expect(response.statusCode).toBe(200);
    expect(balance).toBe(700);
    expect(statement).toHaveLength(2);
  });

  it("should not allow unauthenticated requests", async () => {
    const response = await request(app).get("/api/v1/statements").send();

    expect(response.statusCode).toBe(401);
  });
});
