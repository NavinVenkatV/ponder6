import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt"

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Email",
            credentials: {
                email: { label: "Email", placeholder: "Email", type: "text" },
                password: { label: "Password", placeholder: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const email = credentials.email;
                const password = credentials.password;

                //check whether user already exists
                const existingUser = await prisma.user.findUnique({
                    where: {
                        email: email
                    }
                })

                if (existingUser) {
                    const comparePass = await bcrypt.compare(credentials.password, existingUser.password)
                    if (!comparePass) {
                        return null;
                    }
                    return {
                        id: existingUser.id,
                        email: email
                    }
                }

                if (!existingUser) {
                    const emailValidity = await prisma.user.findFirst({
                        where: {
                            email: email
                        }
                    })
                    if (emailValidity) return null;

                    const hashPass = await bcrypt.hash(password, 10)
                    const user = await prisma.user.create({
                        data: {
                            email,
                            password: hashPass
                        }
                    })

                    return {
                        id: user.id,
                        email: user.email
                    }
                }
                return null;
            },
        })
    ],
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
