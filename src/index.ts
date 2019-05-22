import swaggerParser from 'swagger-parser'
import get from 'lodash.get'
import { Spec as Swagger, Schema } from 'swagger-schema-official'
import faker, { date, internet, random, lorem, finance } from 'faker'
import generateObject from './helpers/object'

export interface Value {
  name: string
  value: string | string[]
  random?: boolean
}

interface Example {
  [key: string]: any
}

/**
 *
 * @param {string | Swagger | Schema} schema
 * @param {string} model
 * @param {boolean} isParser
 * @param {Value} defaultValue
 * @returns {Promise<void>}
 */
export default async function generate<T>(schema: string | Swagger | Schema, model: string,
                                          isParser: boolean = true, defaultValue?: Value[]): Promise<T> {
  let parse = null
  if (isParser) {
    parse = await swaggerParser.dereference(schema as any)
  } else {
    parse = schema
  }

  let entity: { [key: string]: any} = { /* */ }
  let properties = null
  if (parse.definitions) {
    properties = parse.definitions[model].properties
  } else {
    properties = parse.properties
  }
  const example: Example = parse.definitions[model] && parse.definitions[model].example
  for (const field of Object.keys(properties)) {
    if (defaultValue) {
      const dv = defaultValue.findIndex(value => value.name === field)
      if (dv !== -1) {
        if (Array.isArray(defaultValue[dv].value) && defaultValue[dv].random) {
          if (properties[field].type !== 'array') {
            entity[field] = defaultValue[dv].value[Math.floor(Math.random() * defaultValue[dv].value.length)]
          } else {
            const shuffled = (defaultValue[dv].value as string[]).sort(() => .5 - Math.random())
            entity[field] = shuffled.slice(0, random.number(defaultValue[dv].value.length))
          }
        } else {
          entity[field] = defaultValue[dv].value
        }
      } else {
        entity[field] = await typeGen(properties[field], defaultValue, field, example)
      }
    } else {
      entity[field] = await typeGen(properties[field], defaultValue, field, example)
    }
  }
  let allOf = null
  if (parse.definitions) {
    allOf = parse.definitions[model].allOf
  } else {
    allOf = parse.allOf
  }
  if (allOf) {
    for (const schemaAllOf of allOf) {
      entity = {
        ...entity,
        ...await generate(schemaAllOf, schemaAllOf.title, false, defaultValue),
      }
    }
  }
  return entity as T
}

async function typeGen(field: Schema | Schema[] | undefined,
                       defaultValue?: Value[], name: string = '', example?: Example): Promise<any> {
  if (field !== undefined) {
    if (!Array.isArray(field)) {
      switch (field.type) {
        case 'string':
          if (field.enum) {
            return field.enum[Math.floor(Math.random() * field.enum.length)]
          }
          if (name && name.toLowerCase() === 'id' || name.toLowerCase() === '_id') {
            return random.uuid().replace(/-/g, '')
          } else if (field.format && example && example[name]) {
            return stringGen(field, example[name])
          } else if (field.format) {
            return stringGen(field)
          } else if (example && example[name]) {
            return get(faker, example[name] as string)()
          }
          return lorem.sentence()
        case 'number':
          return numberGen(field)
        case 'integer':
          return integerGen(field)
        case 'boolean':
          return random.boolean()
        case 'array':
          const count = random.number(10)
          const array = []
          for (let i = 0; i < count; i += 1) {
            array.push(await typeGen(field.items, defaultValue))
          }
          return array
        case 'object':
          let entity = { /* */ }
          if (field.properties) {
            entity = {
              ...entity,
              ...await typeGen(field.properties as Schema, defaultValue, '', field.example),
            }
          }
          if (field.allOf) {
            for (const schemaAllOf of field.allOf) {
              entity = {
                ...entity,
                ...await generate(schemaAllOf, schemaAllOf.title || '', false),
              }
            }
          }
          if (field.properties || field.allOf) {
            return entity
          }
          return generateObject()
        default: {
          const entities: any = { /* */ }
          for (const key of Object.keys(field)) {
            entities[key] = await typeGen((field as { [key: string]: Schema })[key], defaultValue, key, example)
          }
          return entities
        }
      }
    } else {
      const array = []
      for (const item of field) {
        array.push(await typeGen(item.items, defaultValue))
      }
      return array
    }
  }
  return null
}

function numberGen(field: Schema): number {
  switch (field.format) {
    case 'float':
      if (field.maximum && field.minimum) {
        return Number(finance.amount(field.minimum, field.maximum))
      } else if (field.minimum) {
        return Number(finance.amount(field.minimum))
      } else if (field.maximum) {
        return Number(finance.amount(field.maximum))
      }
      return Number(finance.amount())
    case 'double':
      if (field.maximum && field.minimum) {
        return Number(finance.amount(field.minimum, field.maximum))
      } else if (field.minimum) {
        return Number(finance.amount(field.minimum))
      } else if (field.maximum) {
        return Number(finance.amount(field.maximum))
      }
      return Number(finance.amount())
    default:
      return random.number()
  }
}

function integerGen(field: Schema): number {
  if (field.maximum && field.minimum) {
    return random.number({ min: field.minimum, max: field.maximum })
  } else if (field.minimum) {
    return random.number(field.minimum)
  } else if (field.maximum) {
    return random.number(field.maximum)
  }
  return Number(finance.amount())
}

function stringGen(field: Schema, example?: Example): string | Date {
  let dateRandom = null
  if (example && example.min && example.max) {
    dateRandom = date.between(example.min as string, example.max as string)
  } else {
    dateRandom = date.recent()
  }
  switch (field.format) {
    case 'date':
      return `${dateRandom.getFullYear()}-${dateRandom.getMonth()}-${dateRandom.getDay()}`
    case 'date-time':
      return dateRandom
    case 'password':
      return internet.password()
    case 'byte':
      return btoa(lorem.sentence())
    case 'binary':
      // TODO Change the generation to files with the specified types in description or example
      return random.image()
    case 'email':
      return internet.email()
    case 'uuid':
      return random.uuid()
    case 'uri':
      return internet.url()
    case 'hostname':
      return internet.domainName()
    case 'ipv4':
      return internet.ip()
    case 'ipv6':
      return internet.ipv6()
    default: return ''
  }

}
