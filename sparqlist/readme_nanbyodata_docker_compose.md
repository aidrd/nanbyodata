## Docker Composeの確認とインストール
```
$ docker-compose --version
```
返ってこなければ以下をみてインストール
https://docs.docker.jp/compose/install.html

## 現在のコンテナの削除
```
$ docker rm -f nanbyodata-sparqlist
```

## Docker Composeによる起動

### .envファイルを編集
.envはdocker-compose.ymlの変数部分に値をセットする為のファイル。この2ファイルは同じディレクトリに置く。
```
REPOSITORY=/your/path/repository   <= repositoryディレクトリの絶対パス
SPARQLIST_PORT=3000       <= ホスト側に露出したいポート番号
```

### 起動
docker-compose.ymlの置いてあるディレクトリで実行すること
```
$ sudo /opt/services/case/local/docker-compose/docker-compose up -d
```
docker-compose.ymlに"restart: always"を入れているのでサーバ再起動時にも立ち上がるはず


## (参考)Docker Composeの操作

docker-compose.ymlの置いてあるディレクトリで実行すること

### コンテナ作成と起動
```
$ sudo /opt/services/case/local/docker-compose/docker-compose up -d
```
### コンテナ稼働状況確認
Stateが"Up"なら稼働中、"Exit"なら停止中
```
$ sudo /opt/services/case/local/docker-compose/docker-compose ps
        Name                      Command               State           Ports         
--------------------------------------------------------------------------------------
nanbyodata-sparqlist   docker-entrypoint.sh /bin/ ...   Up      0.0.0.0:3000->3000/tcp
```

### ログ確認
sparqlistのログ確認(docker-compose.ymlに記載したサービス名を指定する)
```
$ sudo /opt/services/case/local/docker-compose/docker-compose logs sparqlist
```
### コンテナ停止
```
$ sudo /opt/services/case/local/docker-compose/docker-compose stop
```
### コンテナ起動
```
$ sudo /opt/services/case/local/docker-compose/docker-compose start
```
### コンテナ停止と削除
```
$ sudo /opt/services/case/local/docker-compose/docker-compose down
```