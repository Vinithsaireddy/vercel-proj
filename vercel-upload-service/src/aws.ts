import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
    accessKeyId: "362b1df190a9522e58983f88cc017c75",
    secretAccessKey: "50b42e20bb1f5e53503f839f52182426ac92e6d1aa7d3c44c8908d3af86644b3",
    endpoint: "https://ece2b5ddb112bf3f83afb9bf9375a4cb.r2.cloudflarestorage.com"
})

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}