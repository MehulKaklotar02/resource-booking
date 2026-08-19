import express from "express";
import bookingRouter from "./booking";
import resourcesRouter from "./resources";
import usersRouter from "./users";
import authRouter from "./auth";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/resources", resourcesRouter);
router.use("/bookings", bookingRouter);
router.use("/users", usersRouter);

export default router;

