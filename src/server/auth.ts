import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, sql } from "drizzle-orm";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type Session,
} from "next-auth";
import { type DefaultJWT, type JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";

import { env } from "@/env.mjs";
import { categories, user } from "@/server/db/schema";
import { type Adapter } from "next-auth/adapters";
import db from "@/server/db/index";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

enum UserRole {
  USER = "USER",
  ADMIN = "OWNER",
}
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
    categoryId: string;
  }

  interface User {
    role: UserRole;
  }
}
declare module "next-auth/adapters" {
  export interface AdapterUser {
    role?: UserRole;
  }
}
declare module "next-auth/jwt" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    emailVerified: Date | null;
    categoryId: string;
  }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      console.log("here;")
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.image = token.picture; // replace 'image' with 'picture'
        // session.categoryId = token.categoryId
      }
      return session;
    },
    jwt: async ({token, trigger}) => {
      console.log("here too");
      const userCheck = await db
        .select()
        .from(user)
        .where(sql`${user.email} = ${token.email}`);
      const dbUser = userCheck[0];

      if (!dbUser) {
        console.log("No User");
        throw new Error("Unable to find user");
      }

      token.id = dbUser.id
      token.email = dbUser.email




      let result

      // if (trigger === "signUp") {
      //   console.log("here 3")
      //   // if (!token.id) {
      //   //   const [userCheck] = await db
      //   //   .select({
      //   //     userId: user.id
      //   //   })
      //   //   .from(user)
      //   //   .where(sql`${user.email} = ${token.email}`);

      //   //   if (!userCheck?.userId) {
      //   //     throw new Error("UserId is not avalable.")
      //   //   }


      //   //   token.id = userCheck.userId
      //   // }
      //   const [data] = await db.insert(categories).values({
      //     priority: '60',
      //     title: "Not Specified",
      //     userId: token.id
      //   }).returning({
      //     categoryId: categories.id
      //   })

      //   if (!data?.categoryId) {
      //     throw new Error("Unable to create a default category.")
      //   }
      //   result = data
      //   token.categoryId = data.categoryId
      // }

      // const [categoryCheck] = await db.select({categoryId: categories.id}).from(categories).where(and(eq(categories.userId, token.id), eq(categories.id, token.categoryId)))
      // console.log("Category check rsult is ", categoryCheck)
      // if (!categoryCheck) {
      //   console.log("No category")
      //   throw new Error("No category exists.")
      // }

      return {
        id: dbUser.id,
        role: dbUser.role as UserRole,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        name: dbUser.name,
        picture: dbUser.image,
        sub: token.sub,
        // categoryId: categoryCheck.categoryId
      } as JWT;
    },
    signIn({ user, account, profile }) {
      
      console.log(user)
      console.log(account)
      console.log(profile)

      return true;

      // const isAllowedToSignIn = true; // You can add your own login logic here
      // if (isAllowedToSignIn) {
      //   return true; // Redirect to a specific page after sign in
      // } else {
      //   // Return false to display a default error message
      //   return false;
      // }
    }
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: env.NEXTAUTH_SECRET,
  },
  secret: env.NEXTAUTH_SECRET,
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  debug: true
  // pages: {},
};

export const getServerAuthSession = () => getServerSession(authOptions);
