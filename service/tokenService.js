const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {

    generateTokens(payload) {
        const accessToken = jwt.sign(payload,
            process.env.JWT_ACCESS_SECRET_KEY,
            {expiresIn: process.env.ACCESS_TOKEN_LIFETIME}
        );
        const refreshToken = jwt.sign(payload,
            process.env.JWT_REFRESH_SECRET_KEY,
            {expiresIn: process.env.REFRESH_TOKEN_LIFETIME}
        );
        return {accessToken, refreshToken};
    };

    async saveToken(userId, refreshToken) {
        console.log("Save Token", userId, refreshToken);
        const tokenData = await tokenModel.findOne({user: userId}).exec();
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenModel.create({user: userId, refreshToken});
        return token;
    };
}

module.exports = new TokenService();