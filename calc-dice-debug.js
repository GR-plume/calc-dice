'use strict'

const dl = Decimal.clone()

const plus = (f, s) => new dl(f).plus(s).toFixed()
const minus = (f, s) => new dl(f).minus(s).toFixed()
const times = (f, s) => new dl(f).times(s).toFixed()
const div = (f, s) => new dl(f).div(s).toFixed()
const mod = (f, s) => new dl(f).modulo(s).toFixed()
const pow = (f, s) => new dl(f).pow(s).toFixed()

const toNum = v => {
  if (v === '' || v === null || typeof v === 'boolean') return NaN
  return Number(v)
}

const ROOP_MAX = 99

const regPow = /(?:\d+\.\d+[+-]|\d+[+-]|\d+\.\d+|\d+|ytinifnI[+-]|ytinifnI)\*\*(?:\d+\.\d+|\d+|ytinifnI)/

const strReverse = str => [...str].reverse().join('')

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

    const op = (toNum(strReverse(result)) >= 0 && /\d|\)|y/.test(rts.slice(index + matched.length).slice(0, 1)) ? '+' : '')
    rts = rts.slice(0, index) + result + op + rts.slice(index + matched.length)
    console.log(strReverse(rts))
  }

  return strReverse(rts)
}

const regTimesDivMod = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)[*/%](?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)/

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

const regPlusMinus = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)[+-](?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+|[+-]Infinity|Infinity)/

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

const calcBasic = str => {
  return calcPlusMinus(calcTimesDivMod(calcPow(str)))
}

const regBrackets = /\([^()]+\)/

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

const regExponential = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+)e(?:[+-]\d+|\d+)/

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

const regExponentialErr = /e[+-]\d+e|e\d+e/

const regInvalidChar = /[^-+/*%.()\dInfity]/

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

  const replacedPow = fixed.replace('^', '**')

  if (regInvalidChar.test(replacedPow)) throw new Error('The formula contains invalid characters')
  if (testInvalidOperator(replacedPow)) throw new Error('The formula contains invalid operators')

  const result = calcBrackets(replacedPow)

  return new dl(result).toNumber()
}

const dice = (roll, max) => {
  const items = [...Array(roll)].map(() => (Math.floor(Math.random() * max) + 1))
  const result = items.reduce((p, c) => p + c, 0)
  return { items, result }
}

const regDice = /(?<![.)d])\d+d\d+(?![.(d])/

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

const calcDice = str => {
  const { diced, show } = replaceDice(str)
  const result = calc(diced)
  return { show, result }
}