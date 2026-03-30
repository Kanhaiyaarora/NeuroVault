import app from "./src/app.js";
import { connectToDb } from "./src/config/db.js";
import { PORT } from "./src/config/env.js";

const startServer = async () => {
  await connectToDb();

  app.listen(PORT, () => {
    console.log(`Server 🚀 Started at the ${PORT}`);
  });
};

startServer();
