![Pushkin Logo](http://i.imgur.com/ncRJMJ5.png)

# Overview
This DB worker has a simple job with a relatively open API.
There is a worker class that handles writes and reads through a message queue.
All models are defined in `./models/`
any bookshelf model that is defined in there will automatically get methods added to the worker class.
add custom methods in `worker.js` to do custom functionality

# Core Features
* regulates and controls DB access in a structured manner
* provides multi client asynchronos access to the db with persistence and the ability to survive restarts/crashes.
* provides multi DB logging, with every transaction on the primnary being logged and saved in a secondary DB.
* uses Bookshelf.js/knex.js as its core ORM for an easiliy extensible way to define models
* provides an easy to use structure for seeds
* tested
![Default DB Schema]('./db_schema.png)


# Get started
1. Creating/modifying the db migrations in the `migrations` directory to match your schema
2. Create/modify the bookshelf models found in `models` directory (they will be automatically sourced in by the db reader)
3. Create/modify the csv files found in `seeds/`

# Extension
* Change the timezone to whatever you want by setting the `TZ` env variable in the `Dockerfile`
* Share and publish other scripts that you may find useful


<a name="Worker"></a>

## Worker
**Kind**: global class

* [Worker](#Worker)
    * [new Worker()](#new_Worker_new)
    * [.createModel(data)](#Worker+createModel) ⇒ <code>any</code>
    * [.findModel(id, [relations])](#Worker+findModel) ⇒ <code>Object</code>
    * [.updateModel(id, data)](#Worker+updateModel) ⇒ <code>Object</code>
    * [.deleteModel(id)](#Worker+deleteModel) ⇒ <code>Number</code>
    * [.queryModel(query, relations)](#Worker+queryModel) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.rawModel(query)](#Worker+rawModel) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.allModels()](#Worker+allModels) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.getInitialQuestions(trialName)](#Worker+getInitialQuestions) ⇒ <code>Array.&lt;Object&gt;</code>

<a name="new_Worker_new"></a>

### new Worker()
DB writer and reader class with automatically generated methods

<a name="Worker+createModel"></a>

### worker.createModel(data) ⇒ <code>any</code>
Create a new Model in the DB

**Kind**: instance method of <code>[Worker](#Worker)</code>
**Returns**: <code>any</code> - The saved model

| Param | Type | Description |
| --- | --- | --- |
| data | <code>any</code> | model to be created |

<a name="Worker+findModel"></a>

### worker.findModel(id, [relations]) ⇒ <code>Object</code>
**Kind**: instance method of <code>[Worker](#Worker)</code>
**Returns**: <code>Object</code> - The model with its relations

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | The id of the model looking for |
| [relations] | <code>Array.&lt;string&gt;</code> | an array of related models to fetch |

<a name="Worker+updateModel"></a>

### worker.updateModel(id, data) ⇒ <code>Object</code>
**Kind**: instance method of <code>[Worker](#Worker)</code>
**Returns**: <code>Object</code> - The newly updated model

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | the id of the model being updated |
| data | <code>Object</code> | the data to update |

<a name="Worker+deleteModel"></a>

### worker.deleteModel(id) ⇒ <code>Number</code>
**Kind**: instance method of <code>[Worker](#Worker)</code>
**Returns**: <code>Number</code> - 0 if success

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | the id of the model to be deleted |

<a name="Worker+queryModel"></a>

### worker.queryModel(query, relations) ⇒ <code>Array.&lt;Object&gt;</code>
**Kind**: instance method of <code>[Worker](#Worker)</code>
**Returns**: <code>Array.&lt;Object&gt;</code> - An array of models returned

| Param | Type | Description |
| --- | --- | --- |
| query | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | a knex.js query array |
| relations | <code>Array.&lt;string&gt;</code> | an Array of relations |

<a name="Worker+rawModel"></a>

### worker.rawModel(query) ⇒ <code>Array.&lt;Object&gt;</code>
Allows raw queries on DB

**Kind**: instance method of <code>[Worker](#Worker)</code>

| Param | Type | Description |
| --- | --- | --- |
| query | <code>Array.&lt;Array.&lt;String&gt;&gt;</code> | a raw knexjs query array |

**Example**
```js
rawModel([
  ['where', 'name', '=', 'foo'],
  ['where', 'age', '<', 20 ],
])
```
<a name="Worker+allModels"></a>

### worker.allModels() ⇒ <code>Array.&lt;Object&gt;</code>
Retun all models in DB

**Kind**: instance method of <code>[Worker](#Worker)</code>
**Returns**: <code>Array.&lt;Object&gt;</code> - all models in DB
<a name="Worker+getInitialQuestions"></a>

### worker.getInitialQuestions(trialName) ⇒ <code>Array.&lt;Object&gt;</code>
Retun all models in DB

**Kind**: instance method of <code>[Worker](#Worker)</code>
**Returns**: <code>Array.&lt;Object&gt;</code> - questions for that Trial

| Param | Type | Description |
| --- | --- | --- |
| trialName | <code>string</code> | The name of the trial looking for inital questions for |