import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Call your backend API to verify user
        const res = await fetch(`${process.env.BACKEND_URL || "http://localhost:8000"}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });
        if (!res.ok) return null;
        const user = await res.json();
        if (user && user.email) {
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.full_name || "Unknown", // Provide a default name if none exists
            isAdmin: user.is_admin || false, // Map is_admin to isAdmin, default to false
            accessToken: user.accessToken || "default-token", // Provide a default or fetch from response
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  jwt: {
    // Optionally add signing key or other options here
  },
  pages: {
    signIn: "/auth", // Custom sign-in page
  },
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name; // name is string per type declaration
        token.isAdmin = user.isAdmin;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email || "", // Fallback to empty string if email is undefined
          name: token.name || "Unknown", // Ensure name is always a string
          isAdmin: token.isAdmin || false,
        };
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };