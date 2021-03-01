# 起動方法

## 1: db.env ファイルの作成

このファイルと同階層に db.env ファイルを作成し Postgresql の環境変数を設定します。db.env ファイルは docker コンテナに Postgresql をインストールする際に使用します。

db.env ファイルの内容は以下のとおりです。

```
POSTGRES_USER=Your Postgres UserName
POSTGRES_PASSWORD=Your Postgres Password
PGDATA=/var/lib/postgresql/data/pgdata
```

- ※POSTGRES_USER と POSTGRES_PASSWORD に適当な値を設定してください。
- ※db.env ファイルは git 管理されません

## 2: database.yml ファイルの作成

api ディレクトリ下に database.yml ファイルを作成し Postgresql への接続情報を記載します。データベースの Migration ツールおよび API アプリケーションから利用されます。

database.yml ファイルの内容は以下のとおりです。

```
common:
  host: account_db
  username: Your Postgres UserName
  password: Your Postgres Password
  adapter: postgresql
  encoding: utf-8

production:
  database: production

development:
  database: development

test:
  database: test

```

- ※username と password に適当な値を設定してください。
- ※database.yml ファイルは git 管理されません

## 3: Docker イメージの作成

docker-compose.yml ファイルがある階層に移動し下記のコマンドを実行します。

```
$ docker-compose build --no-cache
```

## 4: Docker コンテナの起動

docker-compose.yml ファイルがある階層に移動し下記のコマンドを実行します。

```
$ docker-compose up -d
```

## 5: 起動確認

api コンテナにログインし db コンテナ にアクセスできるか確認します。まず下記コマンドで api コンテナにログインします。

```
$ docker exec -it account_api bash
```

ログインできたら psql コマンドを使い db コンテナにログインします。

```
$ psql -U"設定ファイルに記載したユーザ名" -h"account_db"
```

パスワードの入力を求められるので設定ファイルに記載したパスワードを入力し、psql プロンプトが表示されれば OK です。

# データベースの初期化

データベースとテーブルの作成を行います。api コンテナにログインし(ログイン方法は前述したとおり)、/opt/migration ディレクトリに移動し、下記コマンドを実行します。

```
$ rake db:init
$ rake migrate:run
```
