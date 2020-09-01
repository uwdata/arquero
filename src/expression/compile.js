import { functions } from '../op';

function compile(code) {
  return (Function('fn', code))(functions);
}

export default {
  expr:  expr => compile(`"use strict"; return (row,data,op)=>${expr};`),
  expr2: expr => compile(`"use strict"; return (row0,data0,row,data)=>${expr};`),
  join:  expr => compile(`"use strict"; return (row1,data1,row2,data2)=>${expr};`),
  param: expr => compile('"use strict"; return ' + expr)
};