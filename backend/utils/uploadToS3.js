import s3 from "../config/awss3.js";

export const uploadToS3 = (buffer, filename, mimeType) =>
  new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `books/${Date.now()}_${filename}`,
      Body: buffer,
      ContentType: "application/pdf",
      ACL: "public-read",
    };

    s3.upload(params, (err, data) => {
      if (err) reject(err);
      else resolve(data.Location);
    });
  });
