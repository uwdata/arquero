import error from '../util/error';
import isArray from '../util/is-array';
import isFunction from '../util/is-function';
import isNumber from '../util/is-number';
import isObject from '../util/is-object';
import isString from '../util/is-string';
import toArray from '../util/to-array';
import parse from '../expression/parse';
import { isSelection, toObject } from './util';

import { Column } from '../expression/ast/constants';
import {
  Descending,
  Expr,
  ExprList,
  ExprNumber,
  ExprObject,
  JoinKeys,
  JoinValues,
  Options,
  OrderbyKeys,
  Selection,
  SelectionList,
  TableRef,
  TableRefList,
  Window
} from './constants';

const Methods = {
  [Expr]: astExpr,
  [ExprList]: astExprList,
  [ExprNumber]: astExprNumber,
  [ExprObject]: astExprObject,
  [JoinKeys]: astJoinKeys,
  [JoinValues]: astJoinValues,
  [OrderbyKeys]: astExprList,
  [SelectionList]: astSelectionList
};

export default function(value, type, propTypes, opt) {
  return type === TableRef ? astTableRef(value)
    : type === TableRefList ? value.map(astTableRef)
    : ast(toObject(value), type, propTypes, opt);
}

function ast(value, type, propTypes, opt) {
  return type === Options
    ? (value ? astOptions(value, propTypes) : value)
    : Methods[type](value, opt);
}

function astOptions(value, types = {}) {
  const output = {};
  for (const key in value) {
    const prop = value[key];
    output[key] = types[key] ? ast(prop, types[key]) : prop;
  }
  return output;
}

function astParse(expr, opt) {
  return parse({ expr }, { ...opt, ast: true }).exprs[0];
}

function astColumn(name) {
  return { type: Column, name };
}

function astColumnIndex(index) {
  return { type: Column, index };
}

function astExprObject(obj, opt) {
  if (isString(obj)) {
    return astParse(obj, opt);
  }

  if (obj.expr) {
    let ast;
    if (obj.field === true) {
      ast = astColumn(obj.expr);
    } else if (obj.func === true) {
      ast = astExprObject(obj.expr, opt);
    }
    if (ast) {
      if (obj.desc) {
        ast = { type: Descending, expr: ast };
      }
      if (obj.window) {
        ast = { type: Window, expr: ast, ...obj.window };
      }
      return ast;
    }
  }

  return Object.keys(obj)
    .map(key => ({
      ...astExprObject(obj[key], opt),
      as: key
    }));
}

function astSelection(sel, opt) {
  const type = Selection;
  return sel.all ? { type, operator: 'all' }
    : sel.not ? { type, operator: 'not', arguments: astExprList(sel.not, opt) }
    : sel.range ? { type, operator: 'range', arguments: astExprList(sel.range, opt) }
    : sel.matches ? { type, operator: 'matches', arguments: sel.matches }
    : error('Invalid input');
}

function astSelectionList(arr, opt) {
  return toArray(arr).map(item => astSelectionItem(item, opt)).flat();
}

function astSelectionItem(val, opt) {
  return isSelection(val) ? astSelection(val, opt)
    : isNumber(val) ? astColumnIndex(val, opt)
    : isString(val) ? astColumn(val, opt)
    : isObject(val) ? Object.keys(val)
      .map(name => ({ type: Column, name, as: val[name] }))
    : error('Invalid input');
}

function astExpr(val, opt) {
  return isSelection(val) ? astSelection(val, opt)
    : isNumber(val) ? astColumnIndex(val, opt)
    : isString(val) ? astColumn(val, opt)
    : isObject(val) ? astExprObject(val, opt)
    : error('Invalid input');
}

function astExprList(arr, opt) {
  return toArray(arr).map(val => astExpr(val, opt)).flat();
}

function astExprNumber(val, opt) {
  return isNumber(val) ? val : astExprObject(val, opt);
}

function astJoinKeys(val, opt) {
  return isArray(val)
    ? val.map(subVal => astExprList(subVal, opt))
    : astExprObject(val, { ...opt, join: true });
}

function astJoinValues(val, opt) {
  return isArray(val)
    ? val.map((v, i) => i < 2
        ? astExprList(v)
        : astExprObject(v, { ...opt, join: true })
      )
    : astExprObject(val, { ...opt, join: true });
}

function astTableRef(value) {
  return value && isFunction(value.toAST)
    ? value.toAST()
    : value;
}