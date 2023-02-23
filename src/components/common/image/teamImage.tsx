import React from "react";
import Image from "next/image";

import nflImageKey from "../../../data/nfl-teams.json";

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

type T = IntRange<0, 32>;

interface Props {
  teamLogoId: T;
}

const TeamImage = ({ teamLogoId }: Props) => {
  return (
    <Image
      fill
      src={`/images/nfl-logos/${
        (nflImageKey[teamLogoId.toString() as never] as any).photoUrl as string
      }`}
      alt={teamLogoId.toString()}
    />
  );
};

export default TeamImage;
