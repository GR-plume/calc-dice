# calc-dice

ダイス表記（`1d100`とか`3d6`とか）の文字列を読み解いて実際に振った結果を返す関数を作りました。  
ダイスだけじゃなく普通の計算との組み合わせもいけます。  
（例えば`1d100+15`とか`3d6-1d6`とか）  

使えるのは[グループ化演算子 `( )` ](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Grouping)と[算術演算子 `+-*/%**` ](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators#arithmetic_operators)のみです。  
一応`NaN`, `Infinity`にも対応しています。  

文字列の計算式を実際に計算するにあたって`eval`や`return new Function()`といった危なそうな方法は使っていません。  
正規表現のパターンマッチとかを使ってなんやかんやと自力で構文解析しています。  
また、計算には[decimal.js](https://github.com/MikeMcl/decimal.js)を使っています。

### 使用例

```js
const obj = calcDice('3d6+5')

// obj {
//    show: "[2,3,6]+5",
//    result: 16
// }
```

- 引数 `string`  
ダイス表記や計算式の文字列  
例: `'1d100'` `'72+6'` `'(3d6*5)-(4**2+1d6-1)+(34/2)*(12%7)'`  

- 返値 `object`  
プロパティ  
`show` - `string` : ダイスの出目の内訳を含めた最終的な計算式  
`result` - `number` : 計算の結果  
