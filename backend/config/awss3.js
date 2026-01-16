import AWS from "aws-sdk";

import dotenv from "dotenv";
dotenv.config();


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  // signatureVersion: "v4",
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

export default s3;
