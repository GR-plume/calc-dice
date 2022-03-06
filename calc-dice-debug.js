'use strict'

// you need to import decimal.js
const dl = Decimal.clone()

// decimal.jsを使った算術演算
const plus = (f, s) => new dl(f).plus(s).toFixed()
const minus = (f, s) => new dl(f).minus(s).toFixed()
const times = (f, s) => new dl(f).times(s).toFixed()
const div = (f, s) => new dl(f).div(s).toFixed()
const mod = (f, s) => new dl(f).modulo(s).toFixed()
const pow = (f, s) => new dl(f).pow(s).toFixed()

// 空文字、null、booleanでもNaNを返すNumberコンストラクタ
const toNum = v => {
  if (v === '' || v === null || typeof v === 'boolean') return NaN
  return Number(v)
}

// whileの無限ループ防ぐための最大ループ回数
const ROOP_MAX = 99

// 文字列の計算式を演算子の優先順位通りに計算する
// 正規表現で優先度の1番高い演算子を見つけて、実際に計算した結果に置き換えていく
// これをくりかえして最終的に演算子のない文字列(=計算結果)が出来上がる

// べき乗(**)の計算にマッチする
const regPow = /(?:\d+\.\d+[+-]|\d+[+-]|\d+\.\d+|\d+|ytinifnI[+-]|ytinifnI)\*\*(?:\d+\.\d+|\d+|ytinifnI)/

// べき乗は他の計算と違って右側から評価されるので、文字列を反転する
const strReverse = str => [...str].reverse().join('')

// べき乗の計算 文字列から [数字]**[数字] が無くなるまでくりかえす
const calcPow = str => {
  if (/NaN/.test(str)) return NaN

  let rts = strReverse(str)
  let regResult
  let roop = 0

  while ((regResult = regPow.exec(rts)) !== null) {
    roop++
    if (roop > ROOP_MAX) throw new Error('Too many loops in while()')

    const matched = regResult[0]
    const index = regResult.index
    const args = strReverse(matched).split('**')

    const result = strReverse(pow(toNum(args[0]), toNum(args[1])))
    if (/NaN/.test(result)) return NaN

    // 計算の結果が正の数だと+の演算子が省略されてしまい式がおかしくなるので、+演算子を付け足す
    const op = (toNum(strReverse(result)) >= 0 && /\d|\)|y/.test(rts.slice(index + matched.length).slice(0, 1)) ? '+' : '')
    rts = rts.slice(0, index) + result + op + rts.slice(index + matched.length)
    console.log(strReverse(rts))
  }

  return strReverse(rts)
}

// 乗算除算剰余(*/%)の計算にマッチする
const regTimesDivMod = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)[*/%](?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)/

// 乗算除算剰余 文字列から [数字]*[数字] [数字]/[数字] [数字]%[数字] が無くなるまでくりかえす
const calcTimesDivMod = str => {
  if (/NaN/.test(str)) return NaN

  let _str = str
  let regResult
  let roop = 0

  while ((regResult = regTimesDivMod.exec(_str)) !== null) {
    roop++
    if (roop > ROOP_MAX) throw new Error('Too many loops in while()')

    const matched = regResult[0]
    const index = regResult.index
    const args = matched.split(/([*/%])/g)

    let result
    switch (args[1]) {
      case '*':
        result = times(toNum(args[0]), toNum(args[2]))
        break;
      case '/':
        result = div(toNum(args[0]), toNum(args[2]))
        break;
      case '%':
        result = mod(toNum(args[0]), toNum(args[2]))
        break;
      default:
        throw new Error('Operator Error')
    }
    if (/NaN/.test(result)) return NaN

    const op = (toNum(result) >= 0 && /\d|\)|y/.test([..._str][index - 1]) ? '+' : '')
    _str = _str.slice(0, index) + op + result + _str.slice(index + matched.length)
    console.log(_str)
  }

  return _str
}

// 加算減算(+-)の計算にマッチする
const regPlusMinus = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)[+-](?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)/

// 加算減算 文字列から [数字]+[数字] か [数字]-[数字] が無くなるまでくりかえす
const calcPlusMinus = str => {
  if (/NaN/.test(str)) return NaN

  let _str = str
  let regResult
  let roop = 0

  while ((regResult = regPlusMinus.exec(_str)) !== null) {
    roop++
    if (roop > ROOP_MAX) throw new Error('Too many loops in while()')

    const matched = regResult[0]
    const index = regResult.index

    let result
    if (/\+\-/.test(matched)) {
      const args = matched.split('+')
      result = plus(toNum(args[0]), toNum(args[1]))
    } else if (/\-\+/.test(matched)) {
      const args = matched.split('-+')
      result = minus(toNum(args[0]), toNum(args[1]))
    } else {
      const args = matched.split(/((?<=\d|y)[+-])/g)
      switch (args[1]) {
        case '+':
          result = plus(toNum(args[0]), toNum(args[2]))
          break;
        case '-':
          result = minus(toNum(args[0]), toNum(args[2]))
          break;
        default:
          throw new Error('Operator Error')
      }
    }
    if (/NaN/.test(result)) return NaN

    const op = (toNum(result) >= 0 && /\d|\)|y/.test([..._str][index - 1]) ? '+' : '')
    _str = _str.slice(0, index) + op + result + _str.slice(index + matched.length)
    console.log(_str)
  }

  return _str
}

// 文字列を べき乗 -> 乗算除算剰余 -> 加算減算 の順に置き換えていく
const calcBasic = str => {
  return calcPlusMinus(calcTimesDivMod(calcPow(str)))
}

// 1番ネストの深い括弧()にマッチする
const regBrackets = /\([^()]+\)/

// 括弧の中身を算術演算した結果に置き換えていく
// 括弧が無くなるまでくりかえし、最後に括弧が無くなった式を計算する
const calcBrackets = str => {
  if (/NaN/.test(str)) return NaN

  let _str = str
  let regResult
  let roop = 0

  while ((regResult = regBrackets.exec(_str)) !== null) {
    roop++
    if (roop > ROOP_MAX) throw new Error('Too many loops in while()')

    const matched = regResult[0]
    const index = regResult.index

    const result = calcBasic(matched.slice(1, matched.length - 1))
    if (/NaN/.test(result)) return NaN

    // 計算結果が負の数だった場合、括弧から出すときに正負の変換をする
    if (toNum(result) < 0) {
      if (_str.slice(0, index).slice(-2) === '+-' || _str.slice(0, index).slice(-2) === '-+') {
        _str = _str.slice(0, index - 2) + '+' + result.replace('-', '') + _str.slice(index + matched.length)
        console.log(_str)
        continue;
      }

      if (_str.slice(0, index).slice(-1) === '-') {
        _str = _str.slice(0, index - 1) + '+' + result.replace('-', '') + _str.slice(index + matched.length)
        console.log(_str)
        continue;
      }

      _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
      console.log(_str)
      continue;
    }

    _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
    console.log(_str)
  }

  return calcBasic(_str)
}

// 指数表記(1e+9とか)にマッチする
const regExponential = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+)e(?:[+-]\d+|\d+)/

// 指数表記を元の値に戻す
const fixExponential = str => {
  if (/NaN/.test(str)) return NaN

  let _str = str
  let regResult
  let roop = 0

  while ((regResult = regExponential.exec(_str)) !== null) {
    roop++
    if (roop > ROOP_MAX) throw new Error('Too many loops in while()')

    const matched = regResult[0]
    const index = regResult.index

    const result = new dl(matched).toFixed()
    if (/NaN/.test(result)) return NaN

    if (result < 0) {
      if (_str.slice(0, index).slice(-1) === '-') {
        _str = _str.slice(0, index - 1) + '+' + result.replace('-', '') + _str.slice(index + matched.length)
        console.log(_str)
        continue;
      }

      _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
      console.log(_str)
      continue;
    }

    if (/\d|\)|y/.test([..._str][index - 1])) {
      _str = _str.slice(0, index) + '+' + result + _str.slice(index + matched.length)
      console.log(_str)
      continue;
    }

    _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
    console.log(_str)
  }

  return _str
}

// 間違った指数表記にマッチする
const regExponentialErr = /e[+-]\d+e|e\d+e/

// 式に使わない文字にマッチする
const regInvalidChar = /[^-+/*%.()\dInfity]/

// 無効な演算子にマッチする
const testInvalidOperator = str => {
  return (
    /\+[+/*%.)]|\-[-/*%.)]|\/[/*%.)]|\*[/%.)]|%[/*%.)]|\.[-+/*%.()]/.test(str) ||
    /\([/*%.)]|\)[\d.(]/.test(str) ||
    /^[/*%.)]|[-+/*%.(]$/.test(str) ||
    /[/*%(]\+-|[/*%(]-\+/.test(str) ||
    /-\+-|\+-\+/.test(str) ||
    /\*{3}/.test(str) ||
    /\d\.\d+\./.test(str) ||
    /\d\(/.test(str)
  )
}

// 括弧のエラーをテストする
const testBracketsErr = str => {
  let _str = str
  let regResult
  let roop = 0

  while ((regResult = regBrackets.exec(_str)) !== null) {
    roop++
    if (roop > ROOP_MAX) throw new Error('Too many loops in while()')

    _str = _str.replace(regBrackets, '')
  }

  return /\(|\)/.test(_str)
}

// 文字列の計算の統括
const calc = str => {
  if (str === '') throw new Error(`Invalid argument: '' (Empty String)`)
  if (!str) throw new Error(`Invalid argument: ${str}`)
  if (typeof str !== 'string') throw new Error(`Invalid argument: ${str}`)

  if (/[Na]/.test(str.replace(/NaN/g, ''))) throw new Error('The formula contains invalid characters')
  if (/(?<!^|\(|\+|-|\*|\/|%)NaN(?!$|\)|\+|-|\*|\/|%)/.test(str)) throw new Error('The formula contains invalid operators')
  if (/NaN/.test(str)) return NaN

  if (/[Infity]/.test(str.replace(/Infinity/g, ''))) throw new Error('The formula contains invalid characters')
  if (/(?<!^|\(|\+|-|\*|\/|%)Infinity(?!$|\)|\+|-|\*|\/|%)/.test(str)) throw new Error('The formula contains invalid operators')

  if (testBracketsErr(str)) throw new Error('Brackets Error')

  if (regExponentialErr.test(str)) throw new Error('RegExp Exponential Error')
  const fixed = fixExponential(str)

  // べき乗の記号は^でもあるので**に置き換える
  const replacedPow = fixed.replace('^', '**')

  if (regInvalidChar.test(replacedPow)) throw new Error('The formula contains invalid characters')
  if (testInvalidOperator(replacedPow)) throw new Error('The formula contains invalid operators')

  const result = calcBrackets(replacedPow)

  return new dl(result).toNumber()
}

// ダイス 最小値は1固定 出目の内訳と合計を返す
const dice = (roll, max) => {
  const items = [...Array(roll)].map(() => (Math.floor(Math.random() * max) + 1))
  const result = items.reduce((p, c) => p + c, 0)
  return { items, result }
}

// ダイス 3d6とかにマッチする
const regDice = /(?<![.)d])\d+d\d+(?![.(d])/

// ダイスの部分を振った結果に置き換えて普通の計算式にする
// 内訳を見せるための計算式も作る
const replaceDice = str => {
  let _str = str
  let show = str
  let regResult
  let roop = 0

  while ((regResult = regDice.exec(_str)) !== null) {
    roop++
    if (roop > ROOP_MAX) throw new Error('Too many loops in while(){}')

    const matched = regResult[0]
    const index = regResult.index
    const args = matched.split('d')

    const { items, result } = dice(toNum(args[0]), toNum(args[1]))

    _str = _str.slice(0, index) + result + _str.slice(index + matched.length)

    const showIndex = regDice.exec(show).index
    show = show.slice(0, showIndex) + '[' + items.toString() + ']' + show.slice(showIndex + matched.length)
  }

  return { diced: _str, show }
}

// ダイスと普通の計算の統括
const calcDice = str => {
  const { diced, show } = replaceDice(str)
  const result = calc(diced)
  return { show, result }
}