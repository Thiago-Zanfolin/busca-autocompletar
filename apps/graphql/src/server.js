const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { typeDefs, createResolvers, createBackendClient } = require("./schema");

const PORT = Number(process.env.PORT || 4000);
const API_URL = process.env.API_URL || "http://localhost:8000";

const resolvers = createResolvers(createBackendClient(API_URL));

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: PORT } }).then(({ url }) => {
  console.log(`[graphql] rodando em ${url} — backend em ${API_URL}`);
});
