import {
    GraphQLSchema,
    GraphQLBoolean,
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql';
import Posts, { Post, Draft } from '../models/Posts';
import { makePost } from '../models/factories/PostFactory';
import { createUser } from '../models/factories/UserFactory';
import Users, { IUser } from '../models/Users';
import { encrypt } from '../util/encryption';
import { logger } from '../server';

//todo: use context.user to verify routes / bail
const queryType = new GraphQLObjectType<any, { user: IUser }, any>({
    name: 'RootQuery',
    fields: () => ({
        post: {
            type: postType,
            args: {
                id: {
                    type: GraphQLString,
                },
            },
            resolve: async (_source, args, context, info) => Posts.findById(args.id),
        },
        posts: {
            type: new GraphQLList(postType),
            resolve: async (_source, args, context, info) => Posts.find({}),
        },
        user: {
            type: userType,
            args: {
                id: {
                    description: 'id of the user',
                    type: GraphQLString,
                },
                username: {
                    description: 'handle of the user',
                    type: GraphQLString,
                },
                password: {
                    description: 'password of the user',
                    type: GraphQLString,
                },
                isAdmin: {
                    description: 'is this an admin user',
                    type: GraphQLBoolean,
                },
            },
            resolve: async (_source, { id, username, password }) => {
                if (id) {
                    return Users.findById(id);
                }
                //login
                if (username && password) {
                    const user = await Users.findOne({ username, password: encrypt(password) }).exec();
                    if (!user) {
                        return false;
                    }
                    if (!user.token) {
                        await user.update({
                            token: encrypt(
                                Math.random()
                                    .toString(36)
                                    .slice(2)
                            ),
                        });
                    }
                    return Users.findOne({ username, password: encrypt(password) });
                }
            },
        },
    }),
});

const mutationType = new GraphQLObjectType({
    name: 'RootMutation',
    fields: () => ({
        createPost: {
            type: postType,
            args: {
                input: {
                    type: GraphQLNonNull(postInputType),
                },
            },
            resolve: async (_source, { input }) => {
                const user = await Users.findById(input.userId),
                    post = makePost({ title: input.title, user });
                post.drafts = [
                    {
                        content: input.content,
                        active: true,
                        created: new Date(),
                        updated: new Date(),
                    },
                ];
                return Posts.create(post);
            },
        },
        createUser: {
            type: userType,
            args: {
                input: {
                    type: GraphQLNonNull(userInputType),
                },
            },
            resolve: async (_source, { input }) => {
                logger.info('fetching');
                logger.info(input);
                const user = await createUser(input);
                logger.info(user);
                return user;
            },
        },
    }),
});

const postInputType = new GraphQLInputObjectType({
    name: 'PostInput',
    fields: () => ({
        title: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The title of the post.',
        },
        userId: {
            type: GraphQLNonNull(GraphQLString),
            description: "The author's id.",
        },
        content: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The HTML.',
        },
    }),
});

const userInputType = new GraphQLInputObjectType({
    name: 'UserInput',
    fields: () => ({
        name: {
            type: GraphQLNonNull(GraphQLString),
            description: "The user's name.",
        },
        username: {
            type: GraphQLNonNull(GraphQLString),
            description: "The user's login.",
        },
        password: {
            type: GraphQLNonNull(GraphQLString),
            description: "The users's password",
        },
        isAdmin: {
            type: GraphQLNonNull(GraphQLBoolean),
            description: 'is the user an admin',
        },
    }),
});

const postType = new GraphQLObjectType<Post>({
    name: 'Post',
    description: 'A post.',
    fields: () => ({
        _id: {
            type: GraphQLString,
            description: 'The id of the post.',
        },
        title: {
            type: GraphQLString,
            description: 'The title of the post.',
        },
        user: {
            type: userType,
            description: 'The owner of the post.',
            resolve: user => Users.findById(user._id),
        },
        drafts: {
            type: new GraphQLList(draftType),
            description: 'list of drafts.',
        },
        created: {
            type: GraphQLString,
            description: 'when the post was created',
        },
        updated: {
            type: GraphQLString,
            description: 'When the post was updated',
        },
        published: {
            type: GraphQLString,
            description: 'When the post was published',
        },
    }),
});

const draftType = new GraphQLObjectType<Draft>({
    name: 'Draft',
    description: 'A draft.',
    fields: () => ({
        content: {
            type: GraphQLString,
            description: 'The HTML.',
            resolve: user => Users.findById(user._id),
        },
        active: {
            type: GraphQLBoolean,
            description: 'Is the draft the active draft.',
        },
        created: {
            type: GraphQLString,
            description: 'when the post was created',
        },
        updated: {
            type: GraphQLString,
            description: 'When the post was updated',
        },
    }),
});

const userType = new GraphQLObjectType<IUser>({
    name: 'User',
    description: 'A user.',
    fields: () => ({
        _id: {
            type: GraphQLNonNull(GraphQLString),
            description: 'The id of the user.',
        },
        name: {
            type: GraphQLString,
            description: 'The name of the user.',
        },
        isAdmin: {
            type: GraphQLBoolean,
            description: 'Is the user an admin.',
        },
        username: {
            type: GraphQLString,
            description: 'Username.',
        },
        password: {
            type: GraphQLString,
            description: 'Password',
        },
        token: {
            type: GraphQLString,
            description: 'Api Token',
        },
    }),
});

export const Schema = new GraphQLSchema({
    query: queryType,
    //dunno if i need all these
    types: [postType, userType, draftType, userInputType, postInputType],
    mutation: mutationType,
});
