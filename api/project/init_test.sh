#!/bin/sh
# test用データインポートスクリプト
cd ../migration
rake db:init[test]
rake migrate:run[test]
