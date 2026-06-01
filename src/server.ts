import app from "./app";
import config from "./config";
import { connectDB } from "./database";

const main = () => {
    connectDB()
  app.listen(config.port, () => {
    console.log(`server listening on port ${config.port}`);
  });
};

main();
