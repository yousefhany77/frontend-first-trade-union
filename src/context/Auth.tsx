import { decode } from 'jsonwebtoken';
import Router from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
export type DecodedToken = {
  userId: string;
  name: string;
  email: string;
};

type Context = {
  user?: DecodedToken;
  signIn: (userData: { email: string; password: string }) => Promise<void>;
  register: (userData: z.infer<typeof registerSchema>) => Promise<void>;
  logout: () => Promise<void>;
};

export const passwordSchema = z
  .string()
  .min(8)
  .max(25)
  .refine((password) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;
    const isValid = regex.test(password);
    if (!isValid) {
      return {
        code: z.ZodIssueCode.custom,
        path: [],
        message:
          'Password must be 8 to 25 characters long  and contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
      };
    }
    return true;
  });

export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Name is Required',
    })
    .min(3),
  email: z
    .string({
      required_error: 'Email is Required',
    })
    .email({
      message: 'Invalid email',
    }),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is Required',
    })
    .email({
      message: 'Invalid email',
    }),
  password: z.string({
    required_error: 'Password is Required',
  }),
});

const AuthContext = createContext<Context>({
  user: undefined,
  signIn: async () => {},
  logout: async () => {},
  register: async () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken>();

  const register = async (userData: z.infer<typeof registerSchema>) => {
    // Send a POST request to your backend API to register the user
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/register', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }
    const { token } = await res.json();
    const decodedToken = decode(token);

    // If registration was successful, set the userData to local storage
    localStorage.setItem('userData', JSON.stringify(decodedToken));

    setUser(decodedToken as DecodedToken);
  };

  const signIn = async (userData: { email: string; password: string }) => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }
    const { token } = await res.json();
    const decodedToken = decode(token);

    // Also set the userData to local storage
    localStorage.setItem('userData', JSON.stringify(decodedToken));

    setUser(decodedToken as DecodedToken);
  };

  const logout = async () => {
    try {
      // Remove the userData from local storage
      localStorage.removeItem('userData');
      // Remove the userData from state
      setUser(undefined);
      const log = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/logout', {
        credentials: 'include',
        method: 'POST',
      });
      if (!log.ok) {
        const error = await log.json();
        throw new Error(error.message);
      }
      Router.push('/login');
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  // Check if there is an access token in cookies on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  return <AuthContext.Provider value={{ user, signIn, logout, register }}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
