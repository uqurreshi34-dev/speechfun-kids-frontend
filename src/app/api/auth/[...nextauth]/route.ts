// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const {
    handlers: { GET, POST },
    auth,
} = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await axios.post(
                        `${process.env.BACKEND_URL}/api/users/login/`,
                        {
                            username: credentials.username,
                            password: credentials.password,
                        }
                    );

                    const user = res.data.user;

                    if (user) {
                        return {
                            id: String(user.id),
                            username: user.username,
                            email: user.email ?? `${user.username}@local.com`,
                            name: user.name ?? user.username,
                            accessToken: res.data.token,
                        };
                    }
                } catch (error) {
                    console.error("Auth error:", error);
                }

                return null;
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.accessToken = user.accessToken;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
});
