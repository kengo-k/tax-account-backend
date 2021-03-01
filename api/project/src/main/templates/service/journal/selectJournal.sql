select
    *
from
    journals j
where
    -- TODO prepared statementにする
    j.nendo = '<%= nendo %>'
order by
    j.date asc
