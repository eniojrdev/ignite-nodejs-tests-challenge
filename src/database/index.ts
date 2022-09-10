import { createConnection, getConnectionOptions } from "typeorm";

export const createDatabaseConnection = async () => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      database:
        process.env.NODE_ENV === "test"
          ? "fin_api_test"
          : defaultOptions.database,
    })
  );
};
