import { functions } from '../op';

function compile(code, params) {
  code = `"use strict"; return ${code};`;
  return (Function('fn', '$', code))(functions, params);
}

export default {
  expr:  (expr, params) => compile(`(row,data,op)=>${expr}`, params),
  expr2: (expr, params) => compile(`(row0,data0,row,data)=>${expr}`, params),
  join:  (expr, params) => compile(`(row1,data1,row2,data2)=>${expr}`, params),
  param: (expr, params) => compile(expr, params)
};