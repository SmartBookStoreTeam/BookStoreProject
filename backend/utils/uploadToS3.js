import s3 from "../config/awss3.js";

export const uploadToS3 = (
  buffer,
  filename,
  mimeType,
  options = { folder: "books", subfolder: null, isPublic: false },
) =>
  new Promise((resolve, reject) => {
    const safeName = (filename || "file")
      .replace(/\s+/g, "_")
      .replace(/[^\w.\-]/g, "");

    const key = options.subfolder
      ? `${options.folder}/${options.subfolder}/${safeName}`
      : `${options.folder}/${Date.now()}_${safeName}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    };

    if (options.isPublic) params.ACL = "public-read";

    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve({ key: data.Key });
    });
  });
