// routes/project.routes.js

import express from "express";
import projectController from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/download/:projectName", projectController.downloadProject);

export default router;