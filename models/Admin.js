import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Admin name is required"],
  },
  email: {
    type: String,
    required: [true, "Admin email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;