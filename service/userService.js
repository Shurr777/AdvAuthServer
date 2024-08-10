const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const MailService = require("../service/mailService");
const tokenService = require("../service/tokenService");
const UserDto = require("../dtos/user-dto");
``

class UserService {

    async registration(email, password) {
        console.log("UserService registration called");
        const candidate = await UserModel.findOne({email}).exec();
        if (candidate) {
            throw new Error(`User ${email} already exists`);
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

    async activate(activationLink){
        const user = await UserModel.findOne({activationLink}).exec();
        if (!user) {
            throw new Error(`User ${activationLink} does not exist`);
        }
        user.isActivated = true;
        await user.save();
    }
}

module.exports = new UserService();