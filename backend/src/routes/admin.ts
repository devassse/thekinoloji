import { Router } from "express";
import { requireAuth } from "../auth";
import articles from "./articles";
import categories from "./categories";
import users from "./users";
import subscribers from "./subscribers";
import settings from "./settings";
import videos from "./videos";
import misc from "./misc";

const r = Router();
r.use(requireAuth);
r.use("/articles", articles);
r.use("/categories", categories);
r.use("/users", users);
r.use("/subscribers", subscribers);
r.use("/settings", settings);
r.use("/videos", videos);
r.use("/", misc);

export default r;
