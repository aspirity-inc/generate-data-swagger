# generate-data-swagger - Data generator based on swagger scheme

## install
```
yarn add generate-data-swagger
```
or
```
npm install generate-data-swagger
```


## Why should I use it

Allows you to generate various objects, preserving the structure of the swagger scheme.

## Using

You can use two options for setting data generation parameters.
  1. Parameters for each field
  ```
  created_at: {
    type: 'string',
    format: 'date-time',
    example: {
      min: '2017-07-21T17:32:28Z',
      max: '2017-07-23T17:32:28Z'
    },
  }
  ```
   2. Setting parameters for an object
   ```
	"type": "object",
	"example": {
	   "created_at": {
	     "min": "2017-07-21T17:32:28Z",
		  "max": "2017-07-23T17:32:28Z"
		  },
		"mac": "internet.mac"
	}
   ```

```
import generateData from 'generate-data-swagger';
const data = await generateData(schema, model, isParser, defaultValue);
```
schema - path or object scheme swagger
model - the name of the swagger model by which you need to generate data
isParser - bool value  meaning whether to convert the schema to an object or not
```
const defaultValue = [
	{
	  name: 'org', /* name field model in scheme */
	  value: organization.map((org) => org.id), /* string or array string */
	  random: true,  /* if value array whether to choose random values ​​from value */
	}
]
```

##   Parameters of data generation
### Generate number
```
count: {
    type: 'number',
    format: 'double',
    minimum: 5,
    maximum: 10,
}
```
Generation will occur in the range of 5 to 10.

### Generate date

```
 created_at: {
    type: 'string',
    format: 'date-time',
    example: {
      min: '2017-07-21T17:32:28Z',
      max: '2017-07-23T17:32:28Z'
    },
  }
  ```
Date is generated in the range of 2017-07-21T17:32:28Z to 2017-07-23T17:32:28Z.

### Generate  diverse data
```
mac: { type: 'string', example: { mac: 'internet.mac' } },
```
In field example  field name is specified and path before generating the value, path taken from [Faker](https://github.com/marak/Faker.js/#api-methods).

### Generate object
If only type is specified as a type object, without indication properties, object generate of random key and value.