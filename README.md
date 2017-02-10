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
![Default DB Schema](db_schema.png)


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
    * [.createModel(data)](#Worker+createModel) ⇒ <code>Promise</code>
    * [.findModel(id, [relations])](#Worker+findModel) ⇒ <code>Promise</code>
    * [.updateModel(id, data)](#Worker+updateModel) ⇒ <code>Promise</code>
    * [.deleteModel(id)](#Worker+deleteModel) ⇒ <code>Number</code>
    * [.queryModel(query, relations)](#Worker+queryModel) ⇒ <code>Promise</code>
    * [.rawModel(query)](#Worker+rawModel) ⇒ <code>Promise</code>
    * [.allModels()](#Worker+allModels) ⇒ <code>Promise</code>
    * [.getInitialQuestions(trialName)](#Worker+getInitialQuestions) ⇒ <code>Promise</code>
    * [.setUserLanguages(userId, set)](#Worker+setUserLanguages) ⇒ <code>Promise</code>
    * [.getResults(userId)](#Worker+getResults) ⇒ <code>Promise</code>

<a name="new_Worker_new"></a>

### new Worker()
DB writer and reader class with automatically generated methods
**These methods are created automatically based off what it defined by bookshelf**

<a name="Worker+createModel"></a>

### worker.createModel(data) ⇒ <code>Promise</code>

Create a new Model in the DB

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Returns**: <code>Promise</code> - The saved model

**Fulfill**: <code>Object</code>

**Reject**: <code>Error</code>

| Param | Type | Description |
| --- | --- | --- |
| data | <code>any</code> | model to be created |

**Example**

```js
createUser({ name: "Methuselah", age: 1000 })
```
<a name="Worker+findModel"></a>

### worker.findModel(id, [relations]) ⇒ <code>Promise</code>

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object</code> - The found model

**Reject**: <code>Error</code>

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | The id of the model looking for |
| [relations] | <code>Array.&lt;string&gt;</code> | an array of related models to fetch |

**Example**

```js
findUser(1, ['posts'])
```
<a name="Worker+updateModel"></a>

### worker.updateModel(id, data) ⇒ <code>Promise</code>

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object</code> - The newly updated model

**Reject**: <code>Error</code>

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | the id of the model being updated |
| data | <code>Object</code> | the data to update |

**Example**

```js
updateUser(1, { age: 969 })
```
<a name="Worker+deleteModel"></a>

### worker.deleteModel(id) ⇒ <code>Number</code>

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Returns**: <code>Number</code> - 0 if success

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | the id of the model to be deleted |

**Example**
```js
deleteUser(1);
```
<a name="Worker+queryModel"></a>

### worker.queryModel(query, relations) ⇒ <code>Promise</code>

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object[]</code> - An array of models returned

**Reject**: <code>Error</code>

| Param | Type | Description |
| --- | --- | --- |
| query | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | a knex.js query array see http://knexjs.org/#Builder |
| relations | <code>Array.&lt;string&gt;</code> | an Array of relations |

**Example**
```js
queryModel([
 ['where', 'other_id', '=', '5'],
 ['where', 'name', '=', 'foo']
],
['posts']
)
```
<a name="Worker+rawModel"></a>

### worker.rawModel(query) ⇒ <code>Promise</code>
Allows raw queries on DB

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object[]</code> - an array of results

**Reject**: <code>Error</code>

| Param | Type | Description |
| --- | --- | --- |
| query | <code>Array.&lt;Array.&lt;String&gt;&gt;</code> | a raw knexjs query array |

**Example**
```js
rawUser([
  ['where', 'name', '=', 'Methuselah'],
  ['where', 'age', '>', 900 ],
])
```
<a name="Worker+allModels"></a>

### worker.allModels() ⇒ <code>Promise</code>
Return all models in DB

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object[]</code> -  all models in DB

**Reject**: <code>Error</code>

**Example**

```js
allUsers()
```
<a name="Worker+getInitialQuestions"></a>

### worker.getInitialQuestions(trialName) ⇒ <code>Promise</code>
Return all models in DB

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object[]</code> -   questions for that Trial

**Reject**: <code>Error</code>

**Todo**
- [ ] Make this query on the trial Name


| Param | Type | Description |
| --- | --- | --- |
| trialName | <code>string</code> | The name of the trial looking for inital questions for |

<a name="Worker+setUserLanguages"></a>

### worker.setUserLanguages(userId, set) ⇒ <code>Promise</code>
Sets a users Languages

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object</code> - the user with their languages

**Rejects**: <code>Error</code>

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> | the name of the id to set |
| set | <code>Object</code> |  |
| set.primaryLanguages | <code>Array.&lt;String&gt;</code> | the user's primary Languages |
| set.nativeLanguages | <code>Array.&lt;String&gt;</code> | the user's native Languages |

**Example**
```js
setUserLanguages(1, {
 primaryLanguages: ["Hebrew", "Aramaic"],
nativeLanguages: ["Hebrew"]
})
```
<a name="Worker+getResults"></a>

### worker.getResults(userId) ⇒ <code>Promise</code>
Get the results from the DB

**Kind**: instance method of <code>[Worker](#Worker)</code>

**Fulfill**: <code>Object[]</code> - an array of the top 3 languages for this user

**Rejects**: <code>Error</code>

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> | the user whose results you are grabbing |