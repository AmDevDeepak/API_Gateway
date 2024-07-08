const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const axios = require("axios");

const app = express();

const PORT = 3004;
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
});

app.use(morgan("combined"));
app.use(limiter);

app.use("/bookingservice", async (req, res, next) => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/v1/isAuthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"],
        },
      }
    );
    console.log(response.data);
    if (response.data.success) {
      next();
    }
    else {
      return res.status(401).json({
        message: "Not Authorized",
        success: false,
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Something went wrong",
      success: false,
    });
  }
});

app.use(
  "/bookingservice",
  createProxyMiddleware({ target: "http://localhost:3002" })
);

app.get("/home", (req, res) => {
  return res.json({
    message: "Welcome to API Gateway home route.",
  });
});

app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
