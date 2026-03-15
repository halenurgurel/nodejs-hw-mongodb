import multer from 'multer';
import { TEMP_UPLOAD_DIR } from '../constants/index.js';

//multer saves the uploaded file temporarily to disk firs, then we upload it to Cloudinary
const storage = multer.diskStorage({
  destination: TEMP_UPLOAD_DIR,
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});
export const upload = multer({ storage });
