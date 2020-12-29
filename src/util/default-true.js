export default function(value, trueValue = true, falseValue = false) {
  return (value === undefined || value) ? trueValue : falseValue;
}