'use strict'

const dl = Decimal.clone()

dl.DEBUG = true

const plus = (f, s) => new dl(f).plus(s).toFixed()
const minus = (f, s) => new dl(f).minus(s).toFixed()
const times = (f, s) => new dl(f).times(s).toFixed()
const div = (f, s) => new dl(f).div(s).toFixed()
const pow = (f, s) => new dl(f).pow(s).toFixed()

const toNum = v => {
  if(v === '' || v === null || typeof v === 'boolean') return NaN
  return Number(v)
}

const ROOP_MAX = 99

const regNaN = /NaN/
const regInfinity = /Infinity/

const regPow = /(?:\d+\.\d+[+-]|\d+[+-]|\d+\.\d+|\d+)\*\*(?:\d+\.\d+|\d+)/

const regPowErr = /\*\*(?:\d+\.\d+[+-][+-/*(.]|\d+[+-][+-/*(.]|\d+\.\d+[+-]$|\d+[+-]$)/

const strReverse = str => [...str].reverse().join('')

const calcPow = str => {
  if(regInfinity.test(str)) throw new Error('Infinity appeared during the calculation.')
  if(regNaN.test(str)) throw new Error('NaN appeared during the calculation.')
  let rts = strReverse(str)
  if(regPowErr.test(rts)) throw new Error('RegExp Calc Pow Error')
  let regResult
  let roop = 0
  while((regResult = regPow.exec(rts)) !== null){
    roop++
    if(roop > ROOP_MAX) throw new Error('Too many loops in while()')
    if(regInfinity.test(rts)) throw new Error('Infinity appeared during the calculation.')
    if(regNaN.test(rts)) throw new Error('NaN appeared during the calculation.')
    const matched = regResult[0]
    const index = regResult.index
    const args = strReverse(matched).split('**')
    const result = strReverse(pow(toNum(args[0]), toNum(args[1])))
    const op = (result >= 0 && /\d/.test(rts.slice(index + matched.length).slice(0, 1)) ? '+' : '')
    rts = rts.slice(0, index) + result + op + rts.slice(index + matched.length)
  }
  return strReverse(rts)
}

const regTimesDiv = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+)[*/](?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+)/

const calcTimesDiv = str => {
  if(regInfinity.test(str)) throw new Error('Infinity appeared during the calculation.')
  if(regNaN.test(str)) throw new Error('NaN appeared during the calculation.')
  let _str = str
  let regResult
  let roop = 0
  while((regResult = regTimesDiv.exec(_str)) !== null){
    roop++
    if(roop > ROOP_MAX) throw new Error('Too many loops in while()')
    if(regInfinity.test(_str)) throw new Error('Infinity appeared during the calculation.')
    if(regNaN.test(_str)) throw new Error('NaN appeared during the calculation.')
    const matched = regResult[0]
    const index = regResult.index
    const args = matched.split(/([*/])/g)
    let result
    switch (args[1]){
      case '*':
        result = times(toNum(args[0]), toNum(args[2]))
        break;
      case '/':
        result = div(toNum(args[0]), toNum(args[2]))
        break;
      default:
        throw new Error('Operator Error')
    }
    const op = (result >= 0 && /\d|\)/.test([..._str][index - 1]) ? '+' : '')
    _str = _str.slice(0, index) + op + result + _str.slice(index + matched.length)
  }
  return _str
}

const regPlusMinus = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+)[+-](?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+)/

const calcPlusMinus = str => {
  if(regInfinity.test(str)) throw new Error('Infinity appeared during the calculation.')
  if(regNaN.test(str)) throw new Error('NaN appeared during the calculation.')
  let _str = str
  let regResult
  let roop = 0
  while((regResult = regPlusMinus.exec(_str)) !== null){
    roop++
    if(roop > ROOP_MAX) throw new Error('Too many loops in while()')
    if(regInfinity.test(_str)) throw new Error('Infinity appeared during the calculation.')
    if(regNaN.test(_str)) throw new Error('NaN appeared during the calculation.')
    const matched = regResult[0]
    const index = regResult.index
    let result
    if(/\+\-/.test(matched)){
      const args = matched.split('+')
      result = plus(toNum(args[0]), toNum(args[1]))
    }else if(/\-\+/.test(matched)){
      const args = matched.split('-+')
      result = minus(toNum(args[0]), toNum(args[1]))
    }else{
      const args = matched.split(/((?<=\d)[+-])/g)
      switch (args[1]){
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
    const op = (result >= 0 && /\d|\)/.test([..._str][index - 1]) ? '+' : '')
    _str = _str.slice(0, index) + op + result + _str.slice(index + matched.length)
  }
  if(regInfinity.test(_str)) throw new Error('Infinity appeared during the calculation.')
  if(regNaN.test(_str)) throw new Error('NaN appeared during the calculation.')
  return _str
}

const calcFourBasic = str => {
  return calcPlusMinus(calcTimesDiv(calcPow(str)))
}

const regBrackets = /\([^()]+\)/

const calcBrackets = str => {
  let _str = str
  let regResult
  let roop = 0
  while((regResult = regBrackets.exec(_str)) !== null){
    roop++
    if(roop > ROOP_MAX) throw new Error('Too many loops in while()')
    const matched = regResult[0]
    const index = regResult.index
    const result = calcFourBasic(matched.slice(1, matched.length - 1))
    if(result < 0){
      if(_str.slice(0, index).slice(-2) === '+-' || _str.slice(0, index).slice(-2) === '-+'){
        _str = _str.slice(0, index - 2) + '+' + result.replace('-', '') + _str.slice(index + matched.length)
      }else if(_str.slice(0, index).slice(-1) === '-'){
        _str = _str.slice(0, index - 1) + '+' + result.replace('-', '') + _str.slice(index + matched.length)
      }else{
        _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
      }
    }else{
      _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
    }
  }
  return calcFourBasic(_str)
}

const regExponential = /(?:[+-]\d+\.\d+|[+-]\d+|\d+\.\d+|\d+)e(?:[+-]\d+|\d+)/

const fixExponential = str => {
  let _str = str
  let regResult
  let roop = 0
  while((regResult = regExponential.exec(_str)) !== null){
    roop++
    if(roop > ROOP_MAX) throw new Error('Too many loops in while()')
    if(regInfinity.test(_str)) throw new Error('Infinity appeared during the calculation.')
    if(regNaN.test(_str)) throw new Error('NaN appeared during the calculation.')
    const matched = regResult[0]
    const index = regResult.index
    const result = new dl(matched).toFixed()
    if(result < 0){
      if(_str.slice(0, index).slice(-1) === '-'){
        _str = _str.slice(0, index - 1) + '+' + result.replace('-', '') + _str.slice(index + matched.length)
      }else{
        _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
      }
    }else{
      if(/\d|\)/.test([..._str][index - 1])){
        _str = _str.slice(0, index) + '+' + result + _str.slice(index + matched.length)
      }else{
        _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
      }
    }
  }
  if(regInfinity.test(_str)) throw new Error('Infinity appeared during the calculation.')
  if(regNaN.test(_str)) throw new Error('NaN appeared during the calculation.')
  return _str
}

const regExponentialErr = /e[+-]\d+e|e\d+e/

const regNoNeedChar = /[^\d+\-*/()\.]/
const regInvalidOperator = /\)\d|\)\.|\)\(|\d+\.\d+\.|[+-][+-][+-]|\*\*\*|[+-]\*|\*\*[+-][+-]|[/\.][/\.]|\+\+|--|[+*(\-][/\.]|\.[+*()\-]/

const calc = str => {
  if(!str) throw new Error('Calculation Error')
  if(str === '') throw new Error('Calculation Error')
  if(regInfinity.test(str)) throw new Error('The formula contains Infinity')
  if(regNaN.test(str)) throw new Error('The formula contains NaN')
  if(regExponentialErr.test(str)) throw new Error('RegExp Exponential Error')
  const fixed = fixExponential(str)
  const replacedPow = fixed.replace('^', '**')
  if(regNoNeedChar.test(replacedPow)) throw new Error('The formula contains unnecessary characters')
  if(regInvalidOperator.test(replacedPow)) throw new Error('The formula contains invalid operators')
  const result = calcBrackets(replacedPow)
  if(!result) throw new Error('Calculation Error')
  if(result === '') throw new Error('Calculation Error')
  if(regInfinity.test(result)) throw new Error('Infinity appeared during the calculation.')
  if(regNaN.test(result)) throw new Error('NaN appeared during the calculation.')
  if(/\(|\)/.test(result)) throw new Error('Brackets Error')
  return new dl(result).toNumber()
}

const dice = (roll = 1, max) => {
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
  while((regResult = regDice.exec(_str)) !== null){
    roop++
    if(roop > ROOP_MAX) throw new Error('Too many loops in while(){}')
    const matched = regResult[0]
    const index = regResult.index
    const args = matched.split('d')
    const { items, result } = dice(toNum(args[0]), toNum(args[1]))
    const showIndex = regDice.exec(show).index
    // show = show.slice(0, showIndex) + result + '[' + items.toString() + ']' + show.slice(showIndex + matched.length)
    show = show.slice(0, showIndex) + '[' + items.toString() + ']' + show.slice(showIndex + matched.length)
    _str = _str.slice(0, index) + result + _str.slice(index + matched.length)
  }
  return { diced: _str, show }
}

const calcDice = str => {
  const { diced, show } = replaceDice(str)
  const result = calc(diced)
  return { show, result }
}