import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    fristName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
