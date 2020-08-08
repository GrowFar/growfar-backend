const graphql = require('graphql');
const { resolvers, mutations } = require('./modules');

const { GraphQLSchema, GraphQLObjectType } = graphql;

const RootQuery = new GraphQLObjectType({ name: 'Query', fields: { ...resolvers } });

const RootMutation = new GraphQLObjectType({ name: 'Mutation', fields: { ...mutations } });

module.exports = new GraphQLSchema({ query: RootQuery, mutation: RootMutation });
