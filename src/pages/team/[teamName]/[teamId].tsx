import { GetServerSideProps, NextPage } from "next";
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
import getTeamStats from "@/endpoints/team/getTeamStats";
import { PassingStats, TeamStats } from "@/models/stats";
import OffenseSeasonStatsGraph from "@/components/team/OffenseSeasonStatsGraph";
import getTeamPerGameStats from "@/endpoints/team/players/getTeamPerGameStats";

interface Props {
  leadingInts: IGetTeamLeaders;
  leadingPasser: IGetTeamLeaders;
  leadingReceiver: IGetTeamLeaders;
  leadingRusher: IGetTeamLeaders;
  leadingSacks: IGetTeamLeaders;
  leadingTackles: IGetTeamLeaders;
  passingPerGame: PassingStats[];
  team: Team;
  teamSchedule: IGetTeamSchedule[];
  teamStats: TeamStats[];
}

const TeamLanding: NextPage<Props> = ({
  leadingPasser,
  leadingReceiver,
  leadingRusher,
  leadingInts,
  leadingSacks,
  leadingTackles,
  teamSchedule,
  team,
  teamStats,
  passingPerGame,
}: Props) => {
  const router = useRouter();
  const { teamId } = router.query;

  return (
    <div className="w-full h-full flex items-center justify-center">
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
        <BaseCard className="max-w-xl" header="Team Stats">
          <OffenseSeasonStatsGraph
            stats={teamStats}
            perGameStats={{ passing: passingPerGame } as any}
          />
        </BaseCard>
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
              "2": (
                <DefenseList
                  leadingInter={leadingInts}
                  leadingSacker={leadingSacks}
                  leadingTackler={leadingTackles}
                />
              ),
            }}
            footer={{
              href: "#",
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
    const { leagueId } = nookies.get(context);
    const { teamId } = context.query;

    if (!leagueId) throw new Error("unable to find leagueId");

    const numberLeagueId = Number(leagueId);
    const numberTeamId = Number(teamId);

    const leadingPasser: IGetTeamLeaders[] = [];
    const leadingRusher: IGetTeamLeaders[] = [];
    const leadingReceiver: IGetTeamLeaders[] = [];
    const leadingPasserRequest = getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "passing",
      {
        sort_by: "passYds.desc",
        seasonIndex: 0,
      }
    );
    const leadingRusherRequest = getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "rushing",
      {
        sort_by: "rushAtt.desc",
        seasonIndex: 0,
      }
    );
    const leadingReceiverRequest = getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "receiving",
      {
        sort_by: "recYds.desc",
        seasonIndex: 0,
      }
    );

    const settlePromise = await Promise.allSettled([
      leadingPasserRequest,
      leadingRusherRequest,
      leadingReceiverRequest,
    ]);

    const leadingTacklesRequest = await getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "defense",
      {
        sort_by: "defTotalTackles.desc",
        seasonIndex: 0,
      }
    );
    const leadingSacksRequest = await getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "defense",
      {
        sort_by: "defSacks.desc",
        seasonIndex: 0,
      }
    );
    const leadingIntsRequest = await getTeamLeaders(
      numberLeagueId,
      numberTeamId,
      "defense",
      {
        sort_by: "defInts.desc",
        seasonIndex: 0,
      }
    );

    const teamSchedule = await getTeamSchedule(numberLeagueId, numberTeamId, {
      include_teams: true,
    });

    const team = await getTeam(numberLeagueId, numberTeamId, {
      include_standings: true,
      seasonIndex: 0,
    });

    const teamStats = await getTeamStats(numberLeagueId, numberTeamId, {
      seasonIndex: 0,
      season_type: "reg",
    });

    const passingPerGameStats = await getTeamPerGameStats(
      numberLeagueId,
      numberTeamId,
      "passing",
      {
        seasonIndex: 0,
      }
    );

    settlePromise.forEach((s) => {
      if (s.status === "fulfilled") {
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
        leadingTackles: leadingTacklesRequest.body[0],
        leadingSacks: leadingSacksRequest.body[0],
        leadingInts: leadingIntsRequest.body[0],
        team: team.success && team.body,
        teamStats: teamStats && teamStats.body,
        passingPerGame:
          passingPerGameStats && (passingPerGameStats.body as PassingStats[]),
      },
    };
  } catch (error) {
    return {
      props: {},
      redirect: {
        destination: "/league-code",
        permanent: false,
      },
    };
  }
};
