import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";

export const selectLedger = (condition: LedgerSearchRequest) => (sql: any) => {
  return sql`
select
  j.nendo,
  j.date,
  j.another_cd,
  j.karikata_cd,
  j.karikata_value,
  j.kasikata_cd,
  j.kasikata_value,
  sum(
    case
      when
        j.karikata_cd = ${condition.target_cd}
      then
        j.karikata_value else 0 end
  ) over (
    order by
      j.date desc
    rows
      between current row and unbounded following
  ) karikata_sum,
  sum(
    case
      when
        j.kasikata_cd = ${condition.target_cd}
      then
        j.kasikata_value else 0 end
  ) over (
    order by
      j.date desc
    rows
      between current row and unbounded following
  ) kasikata_sum
from
  (
    select
      nendo,
      date,
      karikata_cd,
      kasikata_cd,
      karikata_value,
      kasikata_value,
      case karikata_cd
        when ${condition.target_cd} then kasikata_cd
        else karikata_cd
      end as another_cd,
      created_at
    from
      journals j
    where
      nendo = ${condition.nendo}
      and (
        karikata_cd = ${condition.target_cd}
        or kasikata_cd = ${condition.target_cd}
      )
  ) j
order by
  j.date desc,
  j.created_at desc
`;
};
