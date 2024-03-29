import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Select, { SingleValue } from "react-select";
import TeamImage from "@/components/common/image/teamImage";
import getTeams from "@/endpoints/team/getTeams";
import getAvailableSeasons from "@/endpoints/schedule/getAvailableSeasons";
import { AvailableSeason } from "@/models/schedule";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  setAvailableSeasons,
  setCurrentSeasonIndex,
  setTeams,
} from "@/redux/slices/activeLeague";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { leagueId, teams, availableSeasons } = useAppSelector(
    (state) => state.activeLeague
  );

  const [activeSeason, setActiveSeason] = useState<AvailableSeason>();

  const handleFetch = useCallback(async () => {
    if (leagueId) {
      const teamResponse = await getTeams(leagueId);
      if (teamResponse.success) {
        dispatch(setTeams(teamResponse.body));
      }
      const getSeasons = await getAvailableSeasons(leagueId);
      if (getSeasons.success) {
        dispatch(setAvailableSeasons(getSeasons.body));
      }
    }
  }, [leagueId]);

  const handleSetActiveSeason = (
    newValue: SingleValue<{ label: number; value: number }>
  ) => {
    if (!newValue) return;

    dispatch(setCurrentSeasonIndex(newValue.value));

    setActiveSeason({
      _id: {
        seasonIndex: newValue.value,
      },
      seasonIndex: newValue.value,
      year: newValue.label,
    });
  };

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Select
          options={availableSeasons.map((season) => ({
            label: season.year,
            value: season.seasonIndex,
          }))}
          onChange={handleSetActiveSeason}
        />
        <div className="flex justify-center flex-wrap p-4">
          {activeSeason &&
            Object.values(teams).map((v) => (
              <button
                type="button"
                className="border p-2 flex flex-col space-x-2 w-max m-1 rounded"
                onClick={() =>
                  router.push(
                    `/team/${v.displayName}/${v.teamId}/${activeSeason.seasonIndex}`
                  )
                }
              >
                <div className="flex items-center">
                  <div className="h-12 w-12 relative">
                    <TeamImage teamLogoId={v.logoId} />
                  </div>
                </div>
              </button>
            ))}
        </div>
      </main>
    </>
  );
}
