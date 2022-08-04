// Hardwire Arrow type ids to sidestep dependency
// https://github.com/apache/arrow/blob/master/js/src/enum.ts

export const isDict = ({ typeId }) => typeId === -1;
export const isUtf8 = ({ typeId }) => typeId === 5;
export const isList = ({ typeId }) => typeId === 12;
export const isStruct = ({ typeId }) => typeId === 13;
export const isFixedSizeList = ({ typeId }) => typeId === 16;