import express from "express";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { getAllFiles } from "./file";
import path from "path";
import { uploadFile } from "./aws";
import { createClient } from "redis";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

const publisher = createClient({ 
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' 
});
publisher.connect();

const subscriber = createClient({ url: 'redis://127.0.0.1:6379' });
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;

    if (!repoUrl) {
        return res.status(400).json({ error: "Repository URL is required." });
    }

    const id = generate();
    const outputPath = path.join(__dirname, `output/${id}`);
    await simpleGit().clone(repoUrl, outputPath);

    const files = getAllFiles(outputPath);

    for (const file of files) {
        const relativeFilePath = path.relative(outputPath, file);
        const r2FilePath = `output/${id}/${relativeFilePath}`;
        await uploadFile(r2FilePath, file);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await publisher.lPush("build-queue", id);
    publisher.hSet("status", id, "uploaded");

    res.json({
        id: id,
    });
});

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    });
});

app.listen(3000, () => {
    console.log("http://localhost:3000");
});
