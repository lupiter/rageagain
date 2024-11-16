import { expect } from "chai";
import { dateFormat, militaryTime } from "../../src/lib/DateHelpers.js";

describe("dateFormat", () => {
  it("correctly formats date", () => {
    expect(dateFormat(new Date(2020, 0, 1))).equals("2020-01-01");
    expect(dateFormat(new Date(2020, 11, 15))).equals("2020-12-15");
  });
});

describe("militaryTime", () => {
  it("correctly formats time", () => {
    expect(militaryTime("2:30 pm")).equals("14:30:00");
    expect(militaryTime("2:30 PM")).equals("14:30:00");
    expect(militaryTime("2:30PM")).equals("14:30:00");
    expect(militaryTime("12:00 am")).equals("00:00:00");
    expect(militaryTime("12:00 pm")).equals("12:00:00");
    expect(militaryTime("1:00 am")).equals("01:00:00");
  });
});
