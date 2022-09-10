import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Get Balance", () => {
  let statementsRepository: InMemoryStatementsRepository;
  let usersRepository: InMemoryUsersRepository;
  let getBalanceUseCase: GetBalanceUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should get the balance + statement", async () => {
    const { id: user_id } = await usersRepository.create({
      email: "user@test.com",
      name: "User",
      password: "123456",
    });

    const { type, amount } = await statementsRepository.create({
      user_id,
      type: OperationType.DEPOSIT,
      description: "Statement desc",
      amount: 1000,
    });

    const { balance, statement } = await getBalanceUseCase.execute({
      user_id,
    });

    expect(balance).toBe(1000);
    expect(statement).toHaveLength(1);
    expect(statement[0].type).toBe(type);
    expect(statement[0].amount).toBe(amount);
  });

  it("should not get the balance for a user that does not exist", () => {
    expect(
      getBalanceUseCase.execute({
        user_id: "123",
      })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
