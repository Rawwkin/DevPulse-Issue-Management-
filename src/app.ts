import express, { 
    type Application, 
    type Request, type Response} from "express"

import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issues/issue.route";
import logger from "./middleware/logger";
import cors from "cors";
import { globalErrorHandler } from "./middleware/globalErrorHandler";


const app : Application = express(); 

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended : true}));
app.use(logger)

app.use(  cors({
            origin: "http://localhost:5000",
    }),
  );


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "DevPulse Issue management Application",
    });
  });

app.use("/api/auth", authRoute);
app.use("/appi/issues",issueRoute);

app.use(globalErrorHandler);

export default app;