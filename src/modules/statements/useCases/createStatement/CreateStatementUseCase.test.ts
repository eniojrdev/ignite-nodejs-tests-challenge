import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create Statement", () => {
  let statementsRepository: InMemoryStatementsRepository;
  let usersRepository: InMemoryUsersRepository;
  let createStatementUseCase: CreateStatementUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create new statements", async () => {
    const { id: user_id } = await usersRepository.create({
      email: "user@test.com",
      name: "User",
      password: "123456",
    });

    const deposit = await createStatementUseCase.execute({
      user_id,
      amount: 1000,
      description: "Deposit",
      type: OperationType.DEPOSIT,
    });

    expect(deposit.type).toBe(OperationType.DEPOSIT);
    expect(deposit.amount).toBe(1000);

    const withdraw = await createStatementUseCase.execute({
      user_id,
      amount: 500,
      description: "Withdraw",
      type: OperationType.WITHDRAW,
    });

    expect(withdraw.type).toBe(OperationType.WITHDRAW);
    expect(withdraw.amount).toBe(500);
  });

  it("should be able to withdraw all the balance", async () => {
    const { id: user_id } = await usersRepository.create({
      email: "user@test.com",
      name: "User",
      password: "123456",
    });

    const deposit = await createStatementUseCase.execute({
      user_id,
      amount: 1000,
      description: "Deposit",
      type: OperationType.DEPOSIT,
    });

    expect(deposit.type).toBe(OperationType.DEPOSIT);
    expect(deposit.amount).toBe(1000);

    await createStatementUseCase.execute({
      user_id,
      amount: 1000,
      description: "Withdraw",
      type: OperationType.WITHDRAW,
    });
  });

  it("should be able to able to withdraw an amount greater than the current balance", async () => {
    const { id: user_id } = await usersRepository.create({
      email: "user@test.com",
      name: "User",
      password: "123456",
    });

    const deposit = await createStatementUseCase.execute({
      user_id,
      amount: 1000,
      description: "Deposit",
      type: OperationType.DEPOSIT,
    });

    expect(deposit.type).toBe(OperationType.DEPOSIT);
    expect(deposit.amount).toBe(1000);

    expect(
      createStatementUseCase.execute({
        user_id,
        amount: 1001,
        description: "Invalid Withdraw",
        type: OperationType.WITHDRAW,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a statement for an user that does not exist", () => {
    expect(
      createStatementUseCase.execute({
        user_id: "123",
        amount: 1000,
        description: "Deposit",
        type: OperationType.DEPOSIT,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
