import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// root-level uploads folder
const uploadPath = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);  // ✅ src બહાર uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
export default upload;
