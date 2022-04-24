# cdksample
  aws-cdk勉強用。

## Cfn 作成

- `cdk synth -c env=${env} -c type=${type} --path-metadata false`
  env: 'dev' or 'staging'
  type: 'L1' or 'L2'

cdk.json の conytext に書く環境用の環境変数を定義している。
また、環境変数は-c or --context でコマンド実行時に設定もできる。
今回は各環境の設定を cdk.json に設定し、cdk コマンド実行時に「-c env=」で、どの環境の設定を使用するのかを決定している。
ex) cdk synth -c env=dev
type は L1 で Cfn を作成するか L2 で作成するかを決めている。

--path-metadata false は指定しなければ cdk が Cfn に不要な metadata を出力するので指定している。

## deploy

- `npm install -g aws-cdk`
  ローカルで cdk コマンドを実行するのに必要。

- `cdk bootstrap`
  cdk で作成した環境を実際に AWS に deploy する際に、AWS のユーザーを cdk に紐づける必要がある。
  aws-cli 等でローカルに aws の credential ファイル等を作成してから実行する。
  1 度のみの実行でよい。

- `cdk deploy -c env=${env} -c type=${type} --path-metadata false`
  deploy コマンド。
  synthコマンド実行時同様、cdk.jsonから取得する環境変数を指定。

- `cdk destroy -c env=${env} -c type=${type} --path-metadata false`
  deploy した環境をaws上から削除するコマンド。
  定義したサービス＋CfnのStackも削除される。