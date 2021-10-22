import { VscGithubInverted } from "react-icons/vsc";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../Spinner";

import styles from "./styles.module.scss";

export function LoginBox() {
  const { signInUrl, loading } = useAuth();

  if (loading) return <Spinner />;

  return (
    <div className={styles.loginBoxWrapper}>
      <strong>Entre e compartilhe sua mensagem</strong>
      <a href={signInUrl} className={styles.signInWithGithub}>
        <VscGithubInverted size={24} />
        Entrar com Github
      </a>
    </div>
  );
}
