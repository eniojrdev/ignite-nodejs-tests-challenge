import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class createSenderReceiverColumns1662890014879
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("statements", [
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        isNullable: true,
      }),
      new TableColumn({
        name: "receiver_id",
        type: "uuid",
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
        name: "SENDERUSERFK",
        columnNames: ["sender_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
        name: "RECEIVERUSERFK",
        columnNames: ["receiver_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("statements", "RECEIVERUSERFK");
    await queryRunner.dropForeignKey("statements", "SENDERUSERFK");
    await queryRunner.dropColumns("statements", ["receiver_id", "sender_id"]);
  }
}
