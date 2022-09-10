import { Connection } from "typeorm";
import request from "supertest";
import { app } from "@root/app";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";
import { createDatabaseConnection } from "@root/database";

describe("Authenticate User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    await connection.runMigrations();
    const id = uuidv4({
      random: [
        0x11, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1,
        0x67, 0x1c, 0x58, 0x36,
      ],
    });
    const password = await hash("123456", 8);
    await connection.query(
      `INSERT INTO users(id, name, email, password) VALUES ('${id}', 'User', 'user@auth.com', '${password}')`
    );
  });

  beforeEach(async () => {
    // await connection.runMigrations();
    // const id = "auth";
    // const password = await hash("123456", 8);
    // await connection.query(
    //   `INSERT INTO users(id, name, email, password) VALUES ('${id}', 'User', 'user@auth.com', '${password}')`
    // );
  });

  afterEach(async () => {
    // await connection.dropDatabase();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("authenticates an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@auth.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });
});
