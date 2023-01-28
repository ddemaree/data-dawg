import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "demaree",
  api_key: "368263453154131",
  api_secret: "52MW1MKr0A_6YnmkmQd_FzkHCpM",
  secure: true,
});

export default cloudinary;
