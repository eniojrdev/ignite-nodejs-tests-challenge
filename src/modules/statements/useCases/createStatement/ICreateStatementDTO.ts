import { OperationType, Statement } from "../../entities/Statement";

export type ICreateStatementDTO = Pick<
  Statement,
  "user_id" | "description" | "amount" | "type"
> & {
  type: OperationType.WITHDRAW | OperationType.DEPOSIT;
  sender_id?: string;
  receiver_id?: string;
};

export type ICreateStatementRepository = Pick<
  Statement,
  "user_id" | "description" | "amount" | "type"
> & {
  sender_id?: string;
  receiver_id?: string;
};
