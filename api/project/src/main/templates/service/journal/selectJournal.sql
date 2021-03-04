select
    *
from
    journals j
where
    -- TODO prepared statementにする
    -- require('pg-prepared')が使えるかも...?
    j.nendo = '<%= nendo %>'
order by
    j.date asc
