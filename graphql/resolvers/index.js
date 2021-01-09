const userResolvers = require("./users");
const textResolvers = require("./chatcontents");

module.exports = {
	Message: {
		createdAt: (parent) => parent.createdAt.toISOString(),
	},
	Query: {
		...userResolvers.Query,
		...textResolvers.Query,
	},
	Mutation: {
		...userResolvers.Mutation,
		...textResolvers.Mutation,
	},
};
