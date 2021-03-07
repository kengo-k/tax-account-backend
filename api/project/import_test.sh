#!/bin/sh
# test用データインポートスクリプト
cd ../migration
rake data:import[test,data/$1]
