const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  phone: String
});
const User = mongoose.model('User', userSchema);
module.exports = { User };
