const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB = process.env.MONGO_DB;

const MONGO_COMBINED_URL = `${MONGO_URL}${MONGO_DB}`;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_COMBINED_URL.toString(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(
      "\u001b[" +
        34 +
        "m" +
        `Server started on port: ${process.env.PORT} and Connected to Database` +
        "\u001b[0m"
    );
  } catch (error) {
    console.error(error.message);
    // exit process with failure
    process.exit(1);
  }
};
module.exports = connectDB;
