const userService = require("../service/userService");
const {validationResult} = require("express-validator");
const ApiError = require("../exeptions/api-error");

class UserController {
    async registration(req, res, next) {
        try {
            console.log("UserController registration called");
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

            return res.json(userData);
        } catch (err) {
            next(err)
        }
    }

    async login(req, res, next) {
        try {
            console.log("UserController login called");
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (err) {
            //console.log("User Controller Login Error: ", err);
            next(err);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie("refreshToken");
            return res.json(token);
        } catch (err) {
            //console.log("User Controller Logout Error: ", err);
            next(err);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (err) {
            //console.log("User Controller Activate Error: ", err);
            next(err);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (err) {
            //console.log("User Controller Refresh Error: ", err);
            next(err);
        }
    }

    async getUsers(req, res, next) {
        try {
          const users = await userService.getAllUsers();
          return res.json(users);
        } catch (err) {
            //console.log("User Controller GetUsers Error: ", err);
            next(err);
        }
    }

}

module.exports = new UserController;