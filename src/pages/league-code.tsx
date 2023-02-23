import { NextPage } from "next";
import nookies from "nookies";
import React, { useState } from "react";

const LeagueCode: NextPage = () => {
  const [code, setCode] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    nookies.set(null, "leagueId", code);

    localStorage.setItem("leagueId", code);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input onChange={(e) => setCode(e.currentTarget.value)} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LeagueCode;
