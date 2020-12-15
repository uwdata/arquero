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

export default function(value, type, propTypes) {
  return type === TableRef ? astTableRef(value)
    : type === TableRefList ? value.map(astTableRef)
    : ast(toObject(value), type, propTypes);
}

function ast(value, type, propTypes) {
  return type === Options
    ? (value ? astOptions(value, propTypes) : value)
    : Methods[type](value);
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

function astSelection(sel) {
  const type = Selection;
  return sel.all ? { type, operator: 'all' }
    : sel.not ? { type, operator: 'not', arguments: astExprList(sel.not) }
    : sel.range ? { type, operator: 'range', arguments: astExprList(sel.range) }
    : sel.matches ? { type, operator: 'matches', arguments: sel.matches }
    : error('Invalid input');
}

function astSelectionList(arr) {
  return toArray(arr).map(astSelectionItem).flat();
}

function astSelectionItem(val) {
  return isSelection(val) ? astSelection(val)
    : isNumber(val) ? astColumnIndex(val)
    : isString(val) ? astColumn(val)
    : isObject(val) ? Object.keys(val)
      .map(name => ({ type: Column, name, as: val[name] }))
    : error('Invalid input');
}

function astExpr(val) {
  return isSelection(val) ? astSelection(val)
    : isNumber(val) ? astColumnIndex(val)
    : isString(val) ? astColumn(val)
    : isObject(val) ? astExprObject(val)
    : error('Invalid input');
}

function astExprList(arr) {
  return toArray(arr).map(astExpr).flat();
}

function astExprNumber(val) {
  return isNumber(val) ? val : astExprObject(val);
}

function astJoinKeys(val) {
  return isArray(val)
    ? val.map(astExprList)
    : astExprObject(val, { join: true });
}

function astJoinValues(val) {
  return isArray(val)
    ? val.map((v, i) => i < 2
        ? astExprList(v)
        : astExprObject(v, { join: true })
      )
    : astExprObject(val, { join: true });
}

function astTableRef(value) {
  return value && isFunction(value.toAST)
    ? value.toAST()
    : value;
}