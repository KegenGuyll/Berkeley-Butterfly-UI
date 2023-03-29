import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import nookies from "nookies";
import { IGetTeamLeaders, IGetTeamSchedule, Team } from "@/models/team";
import getTeamSchedule from "@/endpoints/team/schedule/getTeamSchedule";
import getTeamLeaders from "@/endpoints/team/players/getTeamLeaders";
import TeamSchedule from "@/components/schedule/teamSchedule";
import BaseCard from "@/components/common/card/baseCard";
import OffenseList from "@/components/players/teamLeaderCard/offenseList";
import TabCard from "@/components/common/card/tabCard";
import DefenseList from "@/components/players/teamLeaderCard/defenseList";
import getTeam from "@/endpoints/team/getTeam";
import StandingsTable from "@/components/standings/standingsTable";
import { NextPageWithLayout } from "@/pages/_app";

interface Props {
  defense: IGetTeamLeaders[];
  leadingPasser: IGetTeamLeaders;
  leadingReceiver: IGetTeamLeaders;
  leadingRusher: IGetTeamLeaders;
  team: Team;
  teamSchedule: IGetTeamSchedule[];
}

const TeamLanding: NextPageWithLayout<Props> = ({
  leadingPasser,
  leadingReceiver,
  leadingRusher,
  defense,
  teamSchedule,
  team,
}: Props) => {
  const router = useRouter();
  const { teamId } = router.query;

  return (
    <div>
      <div className="flex space-x-10">
        <div className="w-[220px] flex-none">
          <BaseCard
            header="Schedule"
            footer={{
              text: "Full Schedule",
              href: "#",
            }}
            contentPadding={false}
          >
            <TeamSchedule teamId={Number(teamId)} schedule={teamSchedule} />
          </BaseCard>
        </div>
        <div className="w-[300px] flex flex-col space-y-8">
          <BaseCard
            footer={{
              text: "Full Standings",
              href: "#",
            }}
            header={`${team.divName} Standings`}
          >
            <StandingsTable
              currTeam={Number(teamId)}
              standings={team.confStandings}
            />
          </BaseCard>
          <TabCard
            categories={[
              {
                id: "1",
                active: true,
                name: "Offense",
              },
              {
                id: "2",
                active: false,
                name: "Defense",
              },
            ]}
            content={{
              "1": (
                <OffenseList
                  leadingPasser={leadingPasser}
                  leadingRec={leadingReceiver}
                  leadingRusher={leadingRusher}
                />
              ),
              "2": <DefenseList defense={defense} />,
            }}
            footer={{
              href: `${router.asPath}/stats`,
              text: "Full Team Statistics",
            }}
            header="Team Leaders"
            contentPadding={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamLanding;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { leagueId, ...cookies } = nookies.get(context);
    const { teamId, seasonIndex } = context.query;

    console.log(cookies)

    if (!leagueId) throw new Error("unable to find leagueId");

    const numberLeagueId = Number(leagueId);
    const numberTeamId = Number(teamId);
    const numberSeasonIndex = Number(seasonIndex);

    const leadingPasser: IGetTeamLeaders[] = [];
    const leadingRusher: IGetTeamLeaders[] = [];
    const leadingReceiver: IGetTeamLeaders[] = [];
    const leadingDefense: IGetTeamLeaders[] = [];

    const leadingPasserRequest = getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "passing",
      {
        sort_by: "passYds.desc",
        seasonIndex: numberSeasonIndex,
      }
    );
    const leadingRusherRequest = getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "rushing",
      {
        sort_by: "rushAtt.desc",
        seasonIndex: numberSeasonIndex,
      }
    );
    const leadingReceiverRequest = getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "receiving",
      {
        sort_by: "recYds.desc",
        seasonIndex: numberSeasonIndex,
      }
    );

    const defenseRequest = getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "defense",
      {
        sort_by: "defTotalTackles.desc",
        seasonIndex: numberSeasonIndex,
      }
    );

    const settlePromise = await Promise.allSettled([
      leadingPasserRequest,
      leadingRusherRequest,
      leadingReceiverRequest,
      defenseRequest,
    ]);

    const teamSchedule = await getTeamSchedule(numberLeagueId, numberTeamId, {
      include_teams: true,
      seasonIndex: numberSeasonIndex,
    });

    const team = await getTeam(numberLeagueId, numberTeamId, {
      include_standings: true,
      seasonIndex: numberSeasonIndex,
    });

    settlePromise.forEach((s) => {
      if (s.status === "fulfilled") {
        console.log(s.value);
        switch (s.value.body[0].dataType) {
          case "passing":
            leadingPasser.push(...s.value.body);
            break;
          case "rushing":
            leadingRusher.push(...s.value.body);
            break;
          case "receiving":
            leadingReceiver.push(...s.value.body);
            break;
          case "defense":
            leadingDefense.push(...s.value.body);
            break;
          default:
            break;
        }
      }
    });

    return {
      props: {
        leadingPasser: leadingPasser[0],
        leadingRusher: leadingRusher[0],
        leadingReceiver: leadingReceiver[0],
        teamSchedule: teamSchedule.body,
        defense: leadingDefense,
        team: team.success && team.body,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {},
      redirect: {
        destination: "/league-code",
        permanent: false,
      },
    };
  }
};
