class Null {}
export const NULL = new Null();

export enum NullOption {
  Ignore,
  SetNullValue,
}

export enum TreatNull {
  DefaultIgnore,
  DefaultNull,
}
