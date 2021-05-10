import { KamokuBunruiSummaryRequest } from "@common/model/journal/KamokuBunruiSummaryRequest";

export const summaryKamokuBunrui = (condition: KamokuBunruiSummaryRequest) => (
  sql: any
) => {
  return sql`
select
  sum(case
      when karikata_kamoku_bunrui_cd = ${condition.kamoku_bunrui_cd}
      then karikata_value else 0
    end
  ) as karikata_kamoku_bunrui_sum,
  sum(case
      when kasikata_kamoku_bunrui_cd = ${condition.kamoku_bunrui_cd}
      then kasikata_value else 0
    end
  ) as kasikata_kamoku_bunrui_sum
from
  (
    select
      kari_k.kamoku_bunrui_cd as karikata_kamoku_bunrui_cd,
      kasi_k.kamoku_bunrui_cd as kasikata_kamoku_bunrui_cd,
      karikata_value,
      kasikata_value
    from
      journals j
        left join saimoku_masters kari_s on
          kari_s.saimoku_cd = j.karikata_cd
        left join kamoku_masters kari_k on
          kari_k.kamoku_cd = kari_s.kamoku_cd
        left join saimoku_masters kasi_s on
          kasi_s.saimoku_cd = j.kasikata_cd
        left join kamoku_masters kasi_k on
          kasi_k.kamoku_cd = kasi_s.kamoku_cd
    where
      nendo = ${condition.nendo}
  ) j2
where
  j2.karikata_kamoku_bunrui_cd = ${condition.kamoku_bunrui_cd}
  or j2.kasikata_kamoku_bunrui_cd = ${condition.kamoku_bunrui_cd}
`;
};
