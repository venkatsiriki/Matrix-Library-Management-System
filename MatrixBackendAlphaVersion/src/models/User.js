const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, default: 'admin' },
  googleId: { type: String },
  matrixMail: { type: String }
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Virtual for full student ID (department + roll number)
UserSchema.virtual('studentId').get(function() {
  if (this.role !== 'student') return null;
  return `${this.department}${this.rollNumber}`;
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
