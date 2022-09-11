import { Request, Response } from "express";
import { container } from "tsyringe";
import { OperationType } from "../../entities/Statement";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

export class TransferAmountController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: transfer_to_id } = request.params;
    const { id: transfer_from_id } = request.user;
    const { amount, description } = request.body;

    const createStatement = container.resolve(CreateStatementUseCase);

    const transferFrom = await createStatement.execute({
      amount,
      description,
      type: OperationType.WITHDRAW,
      user_id: transfer_from_id,
      receiver_id: transfer_to_id,
    });

    const transferTo = await createStatement.execute({
      amount,
      description,
      type: OperationType.DEPOSIT,
      user_id: transfer_to_id,
      sender_id: transfer_from_id,
    });

    return response.send({
      transferFrom,
      transferTo,
    });
  }
}
