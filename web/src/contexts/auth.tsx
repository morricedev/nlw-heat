import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Spinner } from "../components/Spinner";
import { api } from "../services/api";

interface IUser {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthContextData {
  user: IUser | null;
  signInUrl: string;
  signOut: () => void;
  loading: boolean;
}

export const AuthContext = createContext({} as IAuthContextData);

interface IAuthProvider {
  children: ReactNode;
}

interface IAuthResponse {
  token: string;
  user: IUser;
}

export function AuthProvider({ children }: IAuthProvider) {
  const signInUrl = "http://localhost:4000/github";

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(githubCode: string) {
    setLoading(true);

    const response = await api.post<IAuthResponse>("authenticate", {
      code: githubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem("@dowhile:token", token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
    setLoading(false);
  }

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<IUser>("profile").then((res) => setUser(res.data));
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutCode);

      signIn(githubCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
