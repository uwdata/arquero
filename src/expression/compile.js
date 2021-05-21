import { functions as fn } from '../op';

function compile(code, fn, params) {
  code = `"use strict"; return ${code};`;
  return (Function('fn', '$', code))(fn, params);
}

export default {
  escape: (code, func, params) => compile(code, func, params),
  expr:   (code, params) => compile(`(row,data,op)=>${code}`, fn, params),
  expr2:  (code, params) => compile(`(row0,data0,row,data)=>${code}`, fn, params),
  join:   (code, params) => compile(`(row1,data1,row2,data2)=>${code}`, fn, params),
  param:  (code, params) => compile(code, fn, params)
};