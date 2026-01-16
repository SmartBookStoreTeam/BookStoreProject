import s3 from "../config/awss3.js";

export const getSignedReadUrl = (key, expiresSeconds = 60 * 5) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: expiresSeconds, // بالثواني
  };

  return s3.getSignedUrlPromise("getObject", params);
};
