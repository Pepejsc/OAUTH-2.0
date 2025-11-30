const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true
  },
  clientSecret: {
    type: String,
    required: function() {
      return this.clientType === 'confidential';
    }
  },
  clientName: {
    type: String,
    required: true
  },
  clientType: {
    type: String,
    enum: ['confidential', 'public'],
    default: 'public'
  },
  redirectUris: [{
    type: String,
    required: true
  }],
  grants: {
    type: [String],
    enum: ['authorization_code', 'client_credentials', 'refresh_token'],
    default: ['authorization_code']
  },
  scopes: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', clientSchema);