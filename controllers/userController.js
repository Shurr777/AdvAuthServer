const userService = require("../service/userService");

class UserController {
    async registration(req, res, next) {
        try {
            console.log("UserController registration called");
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie("refreshToken", userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

            return res.json(userData);
        } catch (err) {
            console.log("User Controller Registration Error: ", err);
        }
    }

    async login(req, res) {
        try {

        } catch (err) {
            console.log("User Controller Login Error: ", err);
        }
    }

    async logout(req, res) {
        try {

        } catch (err) {
            console.log("User Controller Logout Error: ", err);
        }
    }

    async activate(req, res) {
        try {
           const activationLink = req.params.link;
           await userService.activate(activationLink);
           return res.redirect(process.env.CLIENT_URL);
        } catch (err) {
            console.log("User Controller Activate Error: ", err);
        }
    }

    async refresh(req, res) {
        try {

        } catch (err) {
            console.log("User Controller Refresh Error: ", err);
        }
    }

    async getUsers(req, res) {
        try {
            res.status(200).json(['123', '456']);
        } catch (err) {
            console.log("User Controller GetUsers Error: ", err);
        }
    }

}

module.exports = new UserController;