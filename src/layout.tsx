import React from "react";
import { useRouter } from "next/router";
import MainNavigation from "./components/navigation";
import TeamHeader from "./components/navigation/teamHeader";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const router = useRouter();

  return (
    <>
      <MainNavigation />
      <main>
        {router.pathname.includes("team") && <TeamHeader />}
        <div className="w-full h-full flex justify-center items-center py-10 px-4">
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
