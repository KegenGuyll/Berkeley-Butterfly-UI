import React from "react";
import { IGetTeamLeaders } from "@/models/team";
import TeamLeaderCard from ".";

interface Props {
  leadingInter: IGetTeamLeaders | undefined;
  leadingSacker: IGetTeamLeaders | undefined;
  leadingTackler: IGetTeamLeaders | undefined;
}

const DefenseList = ({
  leadingTackler,
  leadingSacker,
  leadingInter,
}: Props) => {
  return (
    <div>
      {leadingTackler && leadingTackler.dataType === "defense" && (
        <TeamLeaderCard
          highlightedStat={{
            title: "Tackles",
            value: leadingTackler.defTotalTackles,
          }}
          keyStats={[
            {
              key: "defSacks",
              title: "Sacks",
            },
            {
              key: "defInts",
              title: "Ints",
            },
          ]}
          player={leadingTackler}
        />
      )}
      {leadingSacker && leadingSacker.dataType === "defense" && (
        <TeamLeaderCard
          highlightedStat={{
            title: "Sacks",
            value: leadingSacker.defSacks,
          }}
          keyStats={[
            {
              key: "defTotalTackles",
              title: "Tackles",
            },
          ]}
          player={leadingSacker}
        />
      )}
      {leadingInter && leadingInter.dataType === "defense" && (
        <TeamLeaderCard
          highlightedStat={{
            title: "Interceptions",
            value: leadingInter.defInts,
          }}
          keyStats={[
            {
              key: "defDeflections",
              title: "PD",
            },
            {
              key: "defCatchAllowed",
              title: "CA",
            },
          ]}
          player={leadingInter}
        />
      )}
    </div>
  );
};

export default DefenseList;
