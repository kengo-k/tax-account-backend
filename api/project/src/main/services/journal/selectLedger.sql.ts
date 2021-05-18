import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";

export const selectLedger = (condition: LedgerSearchRequest) => (sql: any) => {
  return sql`
select
  *,
  count(*) over (partition by 1) as all_count
from (
select
  j.id as journal_id,
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
        j.karikata_cd = ${condition.ledger_cd}
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
        j.kasikata_cd = ${condition.ledger_cd}
      then
        j.kasikata_value else 0 end
  ) over (
    order by
      j.date desc
    rows
      between current row and unbounded following
  ) kasikata_sum,
  j.created_at
from
  (
    select
      id,
      nendo,
      date,
      karikata_cd,
      kasikata_cd,
      karikata_value,
      kasikata_value,
      case karikata_cd
        when ${condition.ledger_cd} then kasikata_cd
        else karikata_cd
      end as another_cd,
      created_at
    from
      journals j
    where
      nendo = ${condition.nendo}
      and (
        karikata_cd = ${condition.ledger_cd}
        or kasikata_cd = ${condition.ledger_cd}
      )
  ) j
) j2
where
  (case when ${condition.month} = 'all' then 'all' else ${condition.month} end)
   = (case when ${condition.month} = 'all' then 'all' else substring(j2.date, 5, 2) end)
order by
  j2.date desc,
  j2.created_at desc
limit ${condition.page_size} offset ${condition.offSet}
`;
};
