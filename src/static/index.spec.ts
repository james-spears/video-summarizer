import adder from "./main";

describe("test", () => {
  test("should pass", () => {
    expect(adder(1, 1)).toBe(2);
  });
});
