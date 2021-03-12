import {
  Converter,
  ConverterItem,
  ConverterErrorMessage,
} from "@common/Converter";

interface TestType {
  a: number;
  b: string;
  c?: number | undefined;
}

test("converter", async () => {
  const converter = new Converter<TestType>();
  const { add } = converter;
  add("a", ConverterItem.Number, true);
  add("b", ConverterItem.String, true);
  add("c", ConverterItem.Number, false);

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

  // 異常系(型エラー)
  const res5 = converter.isConvertible({ a: "5", b: "hello" });
  expect(res5.isConvertible()).toBeFalsy();
  expect(res5.errors.length).toEqual(1);
  expect(res5.getError()["a"]).toEqual(ConverterErrorMessage.TypeMismatch);

  // 異常系(複数エラー)
  const res6 = converter.isConvertible({ a: "5", x: 5 });
  expect(res6.isConvertible()).toBeFalsy();
  expect(res6.errors.length).toEqual(3);
  expect(res6.getError()["a"]).toEqual(ConverterErrorMessage.TypeMismatch);
  expect(res6.getError()["b"]).toEqual(ConverterErrorMessage.Required);
  expect(res6.getError()["x"]).toEqual(ConverterErrorMessage.NotExist);
});
