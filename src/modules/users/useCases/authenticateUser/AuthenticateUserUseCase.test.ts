import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Show User Profile", () => {
  let usersRepository: IUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const { id, email } = await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123456",
    });

    const { user, token } = await authenticateUserUseCase.execute({
      email,
      password: "123456",
    });

    expect(user).toBeDefined();
    expect(token).toBeDefined();
    expect(user.id).toBe(id);
  });

  it("should not be able to authenticate an user that does not exist", async () => {
    expect(
      authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "123",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an account with incorrect password", async () => {
    await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123456",
    });

    expect(
      authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "123",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
