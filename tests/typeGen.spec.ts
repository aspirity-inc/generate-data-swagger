import { expect } from 'chai'
import moment from 'moment'
import { Schema } from 'swagger-schema-official'
import { typeGen } from '../src'

describe('typeGen', () => {
  it('should generate a date between the specified range', async () => {
    const schema: Schema = {
      type: 'string',
      format: 'date-time',
      example: { min: '2017-07-21T17:32:28Z', max: '2017-07-23T17:32:28Z' } }
    const result  = moment(await typeGen(schema)).isBetween(schema.example.min, schema.example.max)
    expect(result).to.be.true
  })
  it('should generate of enums',  async () => {
    const enums = ['d', 'a', 'r', 'p']
    const schema: Schema = {
      type: 'string',
      format: 'hostname',
      enum: enums,
    }
    const value = await typeGen(schema)
    const result = enums.findIndex(v => v === value)
    expect(result).to.be.not.equal(-1)
  })
})
