import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http"; 
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  (pinoHttp as any)({ // 🌟 هاد السطر بحل مشكلة الـ Call Signature نهائياً وبجبر التايب سكريبت يمرقها
    logger,
    serializers: {
      req(req: any) { // 🌟 حل إيرور الـ req المفقود نوعه
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) { // 🌟 حل إيرور الـ res المفقود نوعه
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
