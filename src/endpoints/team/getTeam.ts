import createUrl from "@/utils/createUrl";
import { API_ENDPOINT } from "..";
import { IGetTeamQuery, ITeamResponse } from "@/models/team";

const getTeam = async (
  leagueId: number,
  teamId: number,
  query?: IGetTeamQuery
): Promise<ITeamResponse> => {
  const url = `${API_ENDPOINT}/team/${leagueId}/${teamId}`;

  const res = await fetch(createUrl(url, query));
  const result = await res.json();

  return result;
};

export default getTeam;
