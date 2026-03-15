import cloudinary from './cloudinary.js';
import fs from 'node:fs/promises';

//this uploads the temp file to Cloudinary, deletes the temp file and returns the public url
export const saveFileToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.path);
  //delete the temp file after upload
  await fs.unlink(file.path);
  return result.secure_url; //return the cloudinary url
};
