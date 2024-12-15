import express from "express";
import { S3 } from "aws-sdk";

const s3 = new S3({
    accessKeyId: "362b1df190a9522e58983f88cc017c75",
    secretAccessKey: "50b42e20bb1f5e53503f839f52182426ac92e6d1aa7d3c44c8908d3af86644b3",
    endpoint: "https://ece2b5ddb112bf3f83afb9bf9375a4cb.r2.cloudflarestorage.com"
})

const app = express();

app.get("/*", async (req, res) => {
    
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;

    const contents = await s3.getObject({
        Bucket: "vercel",
        Key: `dist/${id}${filePath}`
    }).promise();
    
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(3001);