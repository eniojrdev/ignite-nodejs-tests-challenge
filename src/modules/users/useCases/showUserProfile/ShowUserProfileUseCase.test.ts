import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile", () => {
  let usersRepository: IUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to list the user info", async () => {
    const { id } = await usersRepository.create({
      name: "User",
      email: "user@test.com",
      password: "123456",
    });

    const user = await showUserProfileUseCase.execute(id);

    expect(user.name).toBe("User");
    expect(user.email).toBe("user@test.com");
  });

  it("should not be able to list a user that does not exist", async () => {
    expect(showUserProfileUseCase.execute("123")).rejects.toBeInstanceOf(
      ShowUserProfileError
    );
  });
});
