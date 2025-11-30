const crypto = require('crypto');

class PKCEUtils {
  static generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
  }

  static generateCodeChallenge(codeVerifier) {
    return crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
  }

  static validateCodeChallenge(codeVerifier, codeChallenge, method = 'S256') {
    if (method === 'plain') {
      return codeVerifier === codeChallenge;
    }
    return this.generateCodeChallenge(codeVerifier) === codeChallenge;
  }
}

module.exports = { PKCEUtils };