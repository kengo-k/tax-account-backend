import { SaimokuSearchRequest } from "@common/model/master/SaimokuSearchRequest";

export const selectSaimokuDetail = (condition: SaimokuSearchRequest) => (
  sql: any
) => {
  return sql`
select
  k.kamoku_cd,
  s.saimoku_cd,
  b.kamoku_bunrui_type
from
  saimoku_masters s
    inner join kamoku_masters k on
      k.kamoku_cd = s.kamoku_cd
    inner join kamoku_bunrui_masters b on
      b.kamoku_bunrui_cd = k.kamoku_bunrui_cd
where
  saimoku_cd = ${condition.saimoku_cd}
`;
};
