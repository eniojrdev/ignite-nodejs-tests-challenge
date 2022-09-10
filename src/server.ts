import { app } from "./app";
import { createDatabaseConnection } from "./database";

createDatabaseConnection().then(() => {
  app.listen(3333, () => {
    console.log("Server is running");
  });
});
