import { lorem, random } from 'faker'

export interface ObjectRandom {
  [key: string]: string
}

export default function objectGen(): ObjectRandom {
  const count = random.number(10)
  const tag: ObjectRandom = { }
  for (let i = 0; i < count; i += 1) {
    tag[lorem.word()] = lorem.word()
  }
  return tag
}
