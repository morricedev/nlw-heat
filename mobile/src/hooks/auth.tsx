import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as AuthSessions from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../services/api";

const CLIENT_ID = "721160e01f36df0a6864";
const SCOPE = "read:user";
const USER_STORAGE = "@mobile:user";
const TOKEN_STORAGE = "@mobile:token";

interface IUser {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
}

interface IAuthContextData {
  user: IUser | null;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface IAuthResponse {
  token: string;
  user: IUser;
}

interface IAuthorizationResponse {
  params: {
    code?: string;
    error?: string;
  };
  type: string;
}

export const AuthContext = createContext({} as IAuthContextData);

interface IAuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: IAuthProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(true);

  async function signIn() {
    setIsSigningIn(true);
    try {
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
      const authSessionResponse = (await AuthSessions.startAsync({
        authUrl,
      })) as IAuthorizationResponse;

      if (
        authSessionResponse.type === "success" &&
        authSessionResponse.params.error !== "access_denied"
      ) {
        const authResponse = await api.post<IAuthResponse>("/authenticate", {
          code: authSessionResponse.params.code,
        });

        const { user, token } = authResponse.data;

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
        await AsyncStorage.setItem(TOKEN_STORAGE, token);

        setUser(user);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE);
    await AsyncStorage.removeItem(TOKEN_STORAGE);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      setIsSigningIn(true);
      const userStorage = await AsyncStorage.getItem(USER_STORAGE);
      const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);

      if (userStorage && tokenStorage) {
        api.defaults.headers.common["Authorization"] = `Bearer ${tokenStorage}`;
        setUser(JSON.parse(userStorage));
      }

      setIsSigningIn(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isSigningIn }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
