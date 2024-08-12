const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const MailService = require("../service/mailService");
const tokenService = require("../service/tokenService");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exeptions/api-error");
``

class UserService {

    async registration(email, password) {
        console.log("UserService registration called");
        const candidate = await UserModel.findOne({email}).exec();
        if (candidate) {
            throw ApiError.BadRequest(`User ${email} already exists`);
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const activationLink = uuid.v4();
        const user = await UserModel.create({email, password: hashedPassword, activationLink});
        await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user); // id, email, isActivated
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto};
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink}).exec();
        if (!user) {
            throw ApiError.BadRequest(`User ${activationLink} does not exist`);
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        console.log("UserService login called");
        const user = await UserModel.findOne({email}).exec();
        if (!user) {
            throw ApiError.BadRequest(`Login ${email} does not exist`);
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw ApiError.BadRequest(`Password does not match`); //знаю, так не делается
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto};
    }

    async logout(refreshToken) {
        console.log("UserService logout called");
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        console.log("UserService refreshToken called");
        if (!refreshToken) {
            throw ApiError.UnauthorizedError(`Unable to refresh token`);
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!tokenFromDb || !userData) {
            throw ApiError.UnauthorizedError(`Unable to refresh token`);
        }
        const user = await UserModel.findById(userData.id).exec();
        const userDto = new UserDto(user); // id, email, isActivated
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto};
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService();