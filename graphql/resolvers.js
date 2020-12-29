const { User } = require("../models");

module.exports = {
	Query: {
		// getUsers: async () => {
		//   try {
		//     const users = await User.findAll()

		//     return users
		//   } catch (err) {
		//     console.log(err)
		//   }
		// },
		getUsers: () => {
			const users = [
				{ username: "an", email: "an@an" },
				{ username: "an", email: "an@an" },
			];
			return users;
		},
	},
};
