import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import warehouseRouter from "./routes/warehouse.js";
import fieldRouter from "./routes/field.js";
import kppRouter from "./routes/kpp.js";
import rentalRouter from "./routes/rental.js";
import photosRouter from "./routes/photos.js";

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api", warehouseRouter);
app.use("/api/field", fieldRouter);
app.use("/api/kpp", kppRouter);
app.use("/api", rentalRouter);
app.use("/api/photos", photosRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
