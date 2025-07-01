import { Router } from "express";
import personalRoutes from "./personal";
import sharepointRoutes from "./sharepoint";

const router = Router();

// Mount grouped routes
router.use("/upload/personal", personalRoutes);
router.use("/upload/sharepoint", sharepointRoutes);

// Health check route
router.get("/", (_, res) => {
  res.json({
    message: "Hello, world!",
  });
});

export default router;