export const field = (expr, props) => ({
  expr, field: true, ...props
});

export const func = (expr, props) => ({
  expr, func: true, ...props
});