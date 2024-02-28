const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    // console.log("origin", origin)
    if (
      allowedOrigins.includes(origin)
      || process.env.NODE_ENV === "development"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;