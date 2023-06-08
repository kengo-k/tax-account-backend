import {
  Converter,
  ConverterErrorMessage,
  ConverterItem,
} from "@kengo-k/account-common/Converter";
import {
  EntitySearchCondition,
  EntitySearchType,
} from "@kengo-k/account-common/model/Entity";

interface TestType {
  a: number;
  b: string;
  c?: number | undefined;
}

test("converter", () => {
  const converter = new Converter<TestType>();
  const { add } = converter;
  add("a", ConverterItem.Number, true, true);
  add("b", ConverterItem.String, true, true);
  add("c", ConverterItem.Number, false, true);

  // 正常系(全項目あり)
  const res1 = converter.isConvertible({ a: 5, b: "hello", c: 1 });
  expect(res1.isConvertible()).toBeTruthy();

  // 正常系(cなし)
  const res2 = converter.isConvertible({ a: 5, b: "hello" });
  expect(res2.isConvertible()).toBeTruthy();

  // 異常系(bなし)
  const res3 = converter.isConvertible({ a: 5 });
  expect(res3.isConvertible()).toBeFalsy();
  expect(res3.errors.length).toEqual(1);
  expect(res3.getError()["b"]).toEqual(ConverterErrorMessage.Required);

  // 異常系(存在しないキーx)
  const res4 = converter.isConvertible({ a: 5, b: "hello", x: 5 });
  expect(res4.isConvertible()).toBeFalsy();
  expect(res4.errors.length).toEqual(1);
  expect(res4.getError()["x"]).toEqual(ConverterErrorMessage.NotExist);

  // 異常系(複数エラー)
  const res6 = converter.isConvertible({ a: "5", x: 5 });
  expect(res6.isConvertible()).toBeFalsy();
  expect(res6.errors.length).toEqual(2);
  expect(res6.getError()["b"]).toEqual(ConverterErrorMessage.Required);
  expect(res6.getError()["x"]).toEqual(ConverterErrorMessage.NotExist);
});

interface TestType2 {
  date: string;
}

// prettier-ignore
test("converter/entitySearch/error", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({ date: { searchType: "foo", value: "100" } });
  expect(res1.errors.length).toEqual(1);

  const res2 = converter.isConvertible({ date: { searchType: EntitySearchType.Eq, valueX: "100" } });
  expect(res2.errors.length).toEqual(1);
});

test("converter/entitySearch/eq", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({
    date: { searchType: EntitySearchType.Eq, value: "100" },
  });
  expect(res1.errors.length).toEqual(0);
  const res2 = converter.isConvertible({
    date: { searchType: EntitySearchType.Eq, value: 100 },
  });
  expect(res2.errors.length).toEqual(0);
  const res3 = converter.isConvertible({
    date: { searchType: EntitySearchType.Eq, value: [] },
  });
  expect(res3.errors.length).toEqual(1);
});

test("converter/entitySearch/lte", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({
    date: { searchType: EntitySearchType.LtE, value: "100" },
  });
  expect(res1.errors.length).toEqual(0);
  const res2 = converter.isConvertible({
    date: { searchType: EntitySearchType.LtE, value: 100 },
  });
  expect(res2.errors.length).toEqual(0);
  const res3 = converter.isConvertible({
    date: { searchType: EntitySearchType.LtE, value: [] },
  });
  expect(res3.errors.length).toEqual(1);
});

test("converter/entitySearch/lt", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({
    date: { searchType: EntitySearchType.Lt, value: "100" },
  });
  expect(res1.errors.length).toEqual(0);
  const res2 = converter.isConvertible({
    date: { searchType: EntitySearchType.Lt, value: 100 },
  });
  expect(res2.errors.length).toEqual(0);
  const res3 = converter.isConvertible({
    date: { searchType: EntitySearchType.Lt, value: [] },
  });
  expect(res3.errors.length).toEqual(1);
});

test("converter/entitySearch/gte", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({
    date: { searchType: EntitySearchType.GtE, value: "100" },
  });
  expect(res1.errors.length).toEqual(0);
  const res2 = converter.isConvertible({
    date: { searchType: EntitySearchType.GtE, value: 100 },
  });
  expect(res2.errors.length).toEqual(0);
  const res3 = converter.isConvertible({
    date: { searchType: EntitySearchType.GtE, value: [] },
  });
  expect(res3.errors.length).toEqual(1);
});

test("converter/entitySearch/gt", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({
    date: { searchType: EntitySearchType.Gt, value: "100" },
  });
  expect(res1.errors.length).toEqual(0);
  const res2 = converter.isConvertible({
    date: { searchType: EntitySearchType.Gt, value: 100 },
  });
  expect(res2.errors.length).toEqual(0);
  const res3 = converter.isConvertible({
    date: { searchType: EntitySearchType.Gt, value: [] },
  });
  expect(res3.errors.length).toEqual(1);
});

test("converter/entitySearch/between", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({
    date: { searchType: EntitySearchType.Between, fromTo: ["100", "200"] },
  });
  expect(res1.errors.length).toEqual(0);
  const res2 = converter.isConvertible({
    date: { searchType: EntitySearchType.Between, fromTo: [100, 200] },
  });
  expect(res2.errors.length).toEqual(0);
  const res3 = converter.isConvertible({
    date: { searchType: EntitySearchType.Between, fromTo: "100" },
  });
  expect(res3.errors.length).toEqual(1);
  const res4 = converter.isConvertible({
    date: { searchType: EntitySearchType.Between, fromToX: [100, 200] },
  });
  expect(res4.errors.length).toEqual(1);
});

test("converter/entitySearch/like", () => {
  const converter = new Converter<EntitySearchCondition<TestType2>>();
  const { add } = converter;
  add("date", ConverterItem.EntitySearchItem, true, false);
  const res1 = converter.isConvertible({
    date: { searchType: EntitySearchType.Like, value: "100" },
  });
  expect(res1.errors.length).toEqual(0);
  const res2 = converter.isConvertible({
    date: { searchType: EntitySearchType.Like, value: "100", before: true },
  });
  expect(res2.errors.length).toEqual(0);
  const res3 = converter.isConvertible({
    date: { searchType: EntitySearchType.Like, value: "100", after: true },
  });
  expect(res3.errors.length).toEqual(0);
  const res4 = converter.isConvertible({
    date: {
      searchType: EntitySearchType.Like,
      value: "100",
      before: true,
      after: true,
    },
  });
  expect(res4.errors.length).toEqual(0);
  const res5 = converter.isConvertible({
    date: {
      searchType: EntitySearchType.Like,
      value: "100",
      before: "true",
      after: true,
    },
  });
  expect(res5.errors.length).toEqual(1);
  const res6 = converter.isConvertible({
    date: {
      searchType: EntitySearchType.Like,
      value: "100",
      before: true,
      after: "true",
    },
  });
  expect(res6.errors.length).toEqual(1);
});
