import type { AppProps } from "next/app";
import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const code = localStorage.getItem("leagueId");

    if (!code) {
      router.push("/league-code");
    }
  }, []);

  return <Component {...pageProps} />;
}
