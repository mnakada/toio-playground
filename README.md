#toio plyayground



## はじめに

Sony Interactive Entertainment Inc.の [toio](https://toio.io)の [トイオ・コレクション](https://toio.io/titles/toio-collection.html) 付属のプレイマットを使って経路設定、編集、経路追従するプログラムです。

 [toioの技術仕様](https://toio.github.io/toio-spec/) と [javascript library](https://github.com/toio/toio.js) を使って実現しています。



![playground](https://raw.githubusercontent.com/mnakada/toio-playground/images/toio-playground.jpg)





[![](https://img.youtube.com/vi/fi6TMiUDdPI/0.jpg)]( https://youtu.be/fi6TMiUDdPI)






## 動作環境

- macOS 10.14(Mojave)で確認

   他の環境は未確認

- Node.js  Ver.10.15.3で確認 

  Ver.8以降なら多分OK



## 使い方

以下、MacOS環境です。

ターミナルを起動し、適当な場所にgit cloneします。

```
> cd toioplayground
> npm i
> npm run build
> npm run local
```

これでlocalにweb serverがport 10010で起動します。

ブラウザで [http://localhost:10010](http://localhost:10010) を開くとplaygroundが開きます。



次にトイオ・コレクション付属のプレイマットと充電済みのコアキューブを用意します。

コアキューブの電源を入れるとターミナルに

```
Toio Linked!
```

と表示されます。（されない場合、MacOSのBlueTooth接続が可能な状態かどうか確認してください）

コアキューブをプレイマットの適当な位置に置きキューブの後ろ寄りを上から押すことで底面の機能ボタンを押します。

webのplayground画面では機能ボタンが押されたマット上の位置と同じ場所にポイントが置かれていくので、プレイマット上で適当に場所をずらしながらキューブを使ってポイントを置いていってください。

置かれたポイントをつなぐようにベジェ曲線が引かれていきます。



playground上のポイントとポイントから生えているハンドルを使って曲線を操作することができます。

また、ポイント間の曲線にマウスカーソルを合わせて１秒間グラブ（マウスの左ボタンを長押し）することでポイントを追加できます。

ポイントにマウスカーソルを合わせて'delete'キーを押すことでポイントを削除することもできます。



経路の曲線ができたら、プレイマット上にコアキューブを置いてplaygroundの右上の `Run` ボタンを押すと経路曲線の入り口から出口までコアキューブが走ります。

`Export file` で経路曲線を.tpfファイルにExportします。
ファイルをplaygroundにDrag&Dropするか `Import file` で保存した.tpfファイルの経路データをImportすることができます。

playgroundの経路を消去するには `Clear` を押してください。



現状、コアキューブの電源が落ちたり、Bluetoothが切れたりした場合にはnode.jsのプログラムを再起動しないとコアキューブの再linkができません。

反応が無くなったら、ターミナルのnode.jsのプログラムをCtrl-Cで一旦止めて再度実行してください。



## プログラムについて

簡単にプログラムの構造を説明します。

npm run localを実行するとnode backend/ToioPlayground.jsが起動されます。
ToioPlayground.jsはconfig.jsonファイルを読み込んで、backend/WebService.jsを呼び出します。
ここでWebServerを起動し、backend/ToioConnect.jsを起動します。

ToioConnect.jsはtoioのコアキューブの制御ライブラリを初期化し、コアキューブの座標情報をWebServiceに投げたり、Runした時のシーケンスを実行するプログラムになります。

ToioConnect.jsの中のMoveTarget()がコアキューブを自身の位置とtargetで与えられる目標位置から左右のタイヤの速度を計算して動かす部分になります。ここを色々と書き換えることでコアキューブが目標の経路にどれだけ追従するかをチューニングすることができます。

frontend側でwebの画面を作っているのは、source/vueにあるvue.jsのプログラムです。

webpackでbundle fileにまとめられているのでbuild後の状態からはわかりにくいですが、source/index.htmlからsource/js/ToioPlayground.jsが呼ばれています。vue.jsの表示は以下の通りです。

​	TopMenu.vue : メニューを含めた画面全体

​	Trajectory.vue : コアキューブの通った軌跡を表現している赤い点のレイヤー

​	TopView.vue : BezierCurveEditor.vueのwrapperレイヤー

​	BezierCurveEditor.vue : ベジェ曲線、開始、終了点とハンドルを描画しているレイヤー

これらのレイヤーでbackendから投げられてくるコアキューブの座標情報を表現しています。

また、SVGのベジェ曲線へのGUIを表現しているのはBezierCurveEditor.vueですが、ポイントやハンドルの操作をデータに反映しているのはsource/js/GraphData.jsになります。



