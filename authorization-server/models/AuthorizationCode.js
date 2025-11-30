const mongoose = require('mongoose');

const authorizationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: String,
    required: true
  },
  redirectUri: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  scope: [String],
  codeChallenge: String,
  codeChallengeMethod: {
    type: String,
    enum: ['S256', 'plain']
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
    index: { expires: 0 }
  }
});

module.exports = mongoose.model('AuthorizationCode', authorizationCodeSchema);