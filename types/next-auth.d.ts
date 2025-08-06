import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isAdmin: boolean;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    accessToken?: string;
  }
}
