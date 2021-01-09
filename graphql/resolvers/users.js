const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { User } = require("../../models");
const { JWT_SECRET } = require("../../config/env.json");

module.exports = {
	Query: {
		getUsers: async (_, __, { user }) => {
			try {
				if (!user) throw new AuthenticationError("Unauthenticated");

				const users = await User.findAll({
					where: { username: { [Op.ne]: user.username } },
				});

				return users;
			} catch (err) {
				console.log(err);
				throw err;
			}
		},
		login: async (_, args) => {
			const { username, password } = args;
			let errors = {};

			try {
				if (username.trim() === "")
					errors.username = "username must not be empty";
				if (password === "") errors.password = "password must not be empty";

				if (Object.keys(errors).length > 0) {
					throw new UserInputError("bad input", { errors });
				}

				const user = await User.findOne({
					where: { username },
				});

				if (!user) {
					errors.username = "User not found";
					throw new UserInputError("User not found", { errors });
				}

				const correctPassword = await bcrypt.compare(password, user.password);

				if (!correctPassword) {
					errors.password = "Password is incorrect";
					throw new UserInputError("Password is incorrect", { errors });
				}

				const token = jwt.sign({ username }, JWT_SECRET, {
					expiresIn: 60 * 60,
				});

				return {
					...user.toJSON(),
					createdAt: user.createdAt.toISOString(),
					token,
				};
			} catch (err) {
				console.log(err);
				throw err;
			}
		},
	},
	Mutation: {
		register: async (_, args) => {
			let { username, email, password, confirmPassword } = args;
			let errors = {};

			try {
				// Validate input data
				if (email.trim() === "") errors.email = "Email must not be empty";
				if (username.trim() === "")
					errors.username = "Username must not be empty";
				if (password.trim() === "")
					errors.password = "Password must not be empty";
				if (confirmPassword.trim() === "")
					errors.confirmPassword = "Repeat password must not be empty";

				if (password !== confirmPassword)
					errors.confirmPassword = "Passwords must match";

				// Check if username / email exists,
				// going with this method because
				// if something change in the errors from sequelize,
				// the app is not crash

				const userByUsername = await User.findOne({ where: { username } });
				const userByEmail = await User.findOne({ where: { email } });

				if (userByUsername) errors.username = "Username is taken";
				if (userByEmail) errors.email = "Email is taken";

				if (Object.keys(errors).length > 0) {
					throw errors;
				}

				// Hash password
				password = await bcrypt.hash(password, 6);

				// Create user
				const user = await User.create({
					username,
					email,
					password,
				});

				// Return user
				return user;
			} catch (err) {
				console.log(err);
				// // This method is nice and neat
				// // but for example the path infor now change that lead to the app not work well,
				// // therefore should go with the first option
				// if (err.name === "SequelizeUniqueConstraintError") {
				// 	err.errors.forEach(
				// 		(e) => (errors[e.path] = `${e.value} is already taken`)
				// 	);
				// } else if (err.name === "SequelizeValidationError") {
				// 	err.errors.forEach((e) => (errors[e.path] = e.message));
				// }
				throw new UserInputError("Bad input", { errors });
			}
		},
	},
};
