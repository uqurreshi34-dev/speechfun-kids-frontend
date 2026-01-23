import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            username?: string;
        } & DefaultSession["user"];
    }

    //The & DefaultSession["user"] part means: "Take everything from NextAuth's default user (name, email, image) 
    // AND add my custom fields (id, username)"

    interface User {
        id: string;
        accessToken?: string;
        username?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        accessToken?: string;
    }
}
