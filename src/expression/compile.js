import { functions as fn } from '../op/index.js';

function _compile(code, fn, params) {
  code = `"use strict"; return ${code};`;
  return (Function('fn', '$', code))(fn, params);
}

export const compile = {
  escape: (code, func, params) => _compile(code, func, params),
  expr:   (code, params) => _compile(`(row,data,op)=>${code}`, fn, params),
  expr2:  (code, params) => _compile(`(row0,data0,row,data)=>${code}`, fn, params),
  join:   (code, params) => _compile(`(row1,data1,row2,data2)=>${code}`, fn, params),
  param:  (code, params) => _compile(code, fn, params)
};
