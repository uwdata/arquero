import { Table } from 'apache-arrow';

export default function(arrow) {
  return arrow && arrow.chunks
    ? arrow
    : Table.from(arrow);
}