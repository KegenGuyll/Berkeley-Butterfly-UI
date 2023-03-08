/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-unused-vars */
import type { AppProps } from "next/app";
import "../styles/globals.css";
import { ReactElement, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Layout from "@/layout";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  useEffect(() => {
    const code = localStorage.getItem("leagueId");

    if (!code) {
      router.push("/league-code");
    }
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
