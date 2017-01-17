# Pushkin DB Worker

This DB worker has a simple job with a relatively open API.
There is a worker class that handles writes and reads through a message queue.
All models are defined in `./models/`
any bookshelf model that is defined in there will automatically get methods added to the worker class.
add custom methods in `worker.js` to do custom functionality

## Worker methods
By default the worker has the standard CRUD operations automatically created by creating the model name in the `./models` directory.
Example:
  by creating a bookshelf model `User` the following worker methods are created automatically:
  * `createUser(user: UserSchema): User`
  * `updateUser(id: number, fields: any): User || Error` takes an id and updates any and all fields from an arbitrary JS object
  * `deleteUser(id: number): number || Error` Takes a userId and removes that user, returns 0 for success or an Error
  * `findUser(id: number, relations: string[]]): User || null || Error` takes a userId and an optional array of relations and find that user, returning all fields, and all fields defined on the named relations
  * `queryUser(where: [any[]]): User[] || null || Error` takes queries in the standard knex.js format: Example: `queryUser(['created_at', '>', '2017-01-01'], ['age', '=', 18]])` 
  * `rawUser(query: string): User[] || Error` executes a raw query on the table, returning an array of results or an Error
  * `allUsers(): User[] || Error` return all users
  Alternatively, all these methods could be subclassed in the worker and be available by calling `worker.User.create` for example

  * define methods that can be called in the worker.js file