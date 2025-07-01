import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import routes from "./routes";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
const app = express();
app.enable("trust proxy");
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

// Mount all routes
app.use("/api", routes);
app.use("/", routes);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 9999;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
