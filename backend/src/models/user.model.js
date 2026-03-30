import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
  },
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (){
  const user = this;
  if (!user.isModified("password")) return ;
  user.password = await bcrypt.hash(user.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel