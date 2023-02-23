export interface Schedule {
  awayScore: number;
  awayTeamId: number;
  homeScore: number;
  homeTeamId: number;
  isGameOfTheWeek: boolean;
  scheduleId: number;
  seasonIndex: number;
  stageIndex: number;
  status: number;
  weekIndex: number;
}

export interface IScheduleResponse {
  body: Schedule;
  success: boolean;
}
