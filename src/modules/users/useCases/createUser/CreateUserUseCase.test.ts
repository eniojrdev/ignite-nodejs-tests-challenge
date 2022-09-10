import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create User", () => {
  let usersRepository: IUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a user", async () => {
    await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123456",
    });
  });

  it("should not be able to create a user with the same email", async () => {
    await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123456",
    });

    expect(
      createUserUseCase.execute({
        name: "User",
        email: "user@test.com",
        password: "123456",
      })
    ).rejects.toBeInstanceOf(CreateUserError);
  });
});
