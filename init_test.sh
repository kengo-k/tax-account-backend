#!/bin/sh
# test用データインポートスクリプト
cd ./migration
rake db:init[test] 2>/dev/null
rake migrate:run[test] 2>/dev/null
