import { expect } from 'chai'
import { dateFormat, militaryTime } from "../../src/lib/DateHelpers.js"

describe('dateFormat', () => {
  it('correctly formats date', () => {
    expect(dateFormat(new Date(2020, 0, 1))).be('2020-01-01')
    expect(dateFormat(new Date(2020, 11, 15))).be('2020-12-15')
  })
})

describe('militaryTime', () => {
  it('correctly formats time', () => {
    expect(militaryTime('2:30 pm')).be('14:30:00')
    expect(militaryTime('2:30 PM')).be('14:30:00')
    expect(militaryTime('2:30PM')).be('14:30:00')
    expect(militaryTime('12:00 am')).be('00:00:00')
    expect(militaryTime('12:00 pm')).be('12:00:00')
    expect(militaryTime('1:00 am')).be('01:00:00')
  })
})