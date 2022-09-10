import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Get Statement Operation", () => {
  let statementsRepository: InMemoryStatementsRepository;
  let usersRepository: InMemoryUsersRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should get the balance + statement", async () => {
    const { id: user_id } = await usersRepository.create({
      email: "user@test.com",
      name: "User",
      password: "123456",
    });

    const {
      id: statement_id,
      type,
      amount,
    } = await statementsRepository.create({
      user_id,
      type: OperationType.DEPOSIT,
      description: "Statement desc",
      amount: 1000,
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statement.type).toBe(type);
    expect(statement.amount).toBe(amount);
  });

  it("should not get a statement for a user that does not exist", () => {
    expect(
      getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: "123",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not get a statement that does not exist", async () => {
    const { id: user_id } = await usersRepository.create({
      email: "user@test.com",
      name: "User",
      password: "123456",
    });

    expect(
      getStatementOperationUseCase.execute({
        user_id,
        statement_id: "123",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
