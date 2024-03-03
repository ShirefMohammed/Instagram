const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;