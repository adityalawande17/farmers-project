import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    village: { type: String, default: '' },
  },
  coordinates: {
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
  },
  farmSize: { type: Number, default: 0 },
  preferredLanguage: { type: String, default: 'en', enum: ['en', 'hi', 'mr', 'pa', 'te'] },
  crops: [{ type: String }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
