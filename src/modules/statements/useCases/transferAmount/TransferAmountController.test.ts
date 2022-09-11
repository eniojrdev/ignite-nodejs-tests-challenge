import { app } from "@root/app";
import { createDatabaseConnection } from "@root/database";
import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

describe("Transfer Amount Controller", () => {
  let connection: Connection;
  let transferFromId: string;
  let transferToId: string;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    await connection.runMigrations();

    transferFromId = uuidv4();
    transferToId = uuidv4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${transferFromId}', 'User 1', 'user1@transfer.com', '${password}')`
    );
    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${transferToId}', 'User 2', 'user2@transfer.com', '${password}')`
    );

    await connection.query(
      `INSERT INTO statements(id, user_id, description, amount, type) VALUES ('${uuidv4()}', '${transferFromId}', 'Deposit', 900.00, 'deposit')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to transfer an amount to another account", async () => {
    const loginResponse = await request(app).post("/api/v1/sessions").send({
      email: "user1@transfer.com",
      password: "123456",
    });

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${transferToId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 200,
        description: "Transfer",
      });

    const { transferFrom, transferTo } = response.body;

    expect(response.statusCode).toBe(200);

    expect(transferFrom.amount).toBe(200);
    expect(transferFrom.type).toBe("transfer");
    expect(transferFrom.receiver_id).toBe(transferTo.user_id);

    expect(transferTo.amount).toBe(200);
    expect(transferTo.type).toBe("transfer");
    expect(transferTo.sender_id).toBe(transferFrom.user_id);
  });

  it("should not be able to transfer an amount higher than the current balance", async () => {
    const loginResponse = await request(app).post("/api/v1/sessions").send({
      email: "user1@transfer.com",
      password: "123456",
    });

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${transferToId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 950,
        description: "Invalid Transfer",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should not allow unauthenticated requests", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${transferToId}`)
      .send();

    expect(response.statusCode).toBe(401);
  });
});
