# Authentication Microservice

This microservice is used for managing and authenticating users with full CRUD functionality.

| Method | Path             | Action                                                                                                   |
| ------ | ---------------- | -------------------------------------------------------------------------------------------------------- |
| ANY    | /                | Returns a basic success message to all request methods.                                                  |
| POST   | /auth/login      | Authenticates a user via their username and password.                                                    |
| POST   | /auth            | Validates a users authentication token.                                                                  |
| POST   | /user            | Creates a user in the database..                                                                         |
| GET    | /users           | Returns a list of all users.                                                                             |
| GET    | /user/:id        | Returns user data by ID.                                                                                 |
| PUT    | /user/:id        | Updates user data by ID.                                                                                 |
| DELETE | /user/:id        | Either soft or hard deletes a user by ID. - pass {"hard_delete": true} in the JSON body for hard delete. |
| GET    | /roles           | Returns a list of all roles.                                                                             |
| POST   | /role            | Creates a role in the database..                                                                         |
| GET    | /role/:no        | Returns role data by role number.                                                                        |
| PUT    | /role/:no        | Updates role data by role number.                                                                        |
| DELETE | /role/:no        | Removes role based on role number.                                                                       |
| POST   | /api-keys        | Get a list of all owned api keys.                                                                        |
| POST   | /api-key/query   | Query all existing keys (Admin only).                                                                    |
| POST   | /api-key         | Create a new api-key.                                                                                    |
| POST   | /api-key/:id     | Get a specific api-key (provided you are owner)                                                          |
| PUT    | /api-key/:id     | Update a specific api-key (provided you are owner or admin)                                              |
| DELETE | /api-key/:id     | Remove a specific api-key (provided you are owner or admin)                                              |
| POST   | /api-key/gen/:id | Generate a new token for a specific key                                                                  |

By default there are 2 roles there are 0 and 1 both of which are admins. Any role higher than 1 (2, 3, 4, etc) will be treated as non-admins.

## Endpoints

### General

Returns a basic success message to all request methods.

#### General Request

`ANY /`

#### General Response

| Code | Details                                  |
| ---- | ---------------------------------------- |
| 200  | Simple JSON containing details about API |

### Login

Authenticates a user via their email address and password.

#### Login Request

`POST /auth/login`

##### Login body

```js
{
  /**
   * REQUIRED
   * username for specific user
  */
  username: String,
  /**
   * REQUIRED
   * password for specific user
  */
  password: String,
  /**
   * Default false
   * Determines how long the token is valid
   * (session or JWT_TOKEN_EXPIRE)
  */
  remember: Boolean
}
```

#### Login Response

| Code | Details                                                                    |
| ---- | -------------------------------------------------------------------------- |
| 200  | Everything is groovy, response contains set cookie and body contains token |
| 400  | Something is wrong with the data, response will have more details          |
| 401  | Credentials are incorrect                                                  |
| 500  | Something went wrong server side                                           |

### Auth

Validates a users authentication token.

#### Auth Request

`POST /auth`

##### Auth body

```js
{
  /**
   * Default undefined
   * Determine if the logged in user reached a certain role level
   */
  role: Number;
}
```

#### Auth Response

| Code | Details                                                                     |
| ---- | --------------------------------------------------------------------------- |
| 200  | User is auth'd, response may contain set cookie and body may contain update |
| 401  | User is not auth'd or is not at a high enough role                          |
| 500  | Something went wrong server side                                            |

### Add user

Creates a user in the database..

#### Add user Request

`POST /user`

##### Add user body

```js
{
  /**
   * REQUIRED
   * username to be used for login
  */
  username: String,
  /**
   * REQUIRED
   * password to be used for login
  */
  password: String,
  /**
   * Human readable name for user
  */
  name: String,
  /**
   * Email address for user
  */
  email: String,
  /**
   * Add data of any format against a user
  */
  additionalFields: {
    [key]: any
  }
  /**
   * DEFAULT: 0
   * Level new user should be created at
  */
  role: Number
}
```

#### Add user Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | New user created                                                  |
| 400  | Something is wrong with the data, response will have more details |
| 401  | User is not auth'd or is not at a high enough role                |
| 500  | Something went wrong server side                                  |

### Get users

Returns a list of all users.

#### Get users Request

`GET /users`
`POST /users`

##### Get users body

Body is not required

```js
{
  /**
   * DEFAULT: Infinite
   * Total results per page
  */
  limit: String,
  /**
   * DEFAULT: 0
   * Page to show (starting at 0)
  */
  page: String,
  /**
   * Default: false
   * Show deleted accounts
  */
  include_deleted: Boolean,
  /**
   * Text search across all fields
  */
  search: String,
}
```

#### Get users Response

| Code | Details                                            |
| ---- | -------------------------------------------------- |
| 200  | List of users is in the response                   |
| 401  | User is not auth'd or is not at a high enough role |
| 500  | Something went wrong server side                   |

### Get specific user

Returns user data by ID.

#### Get specific user Request

`GET /users/:id`

#### Get specific user Response

| Code | Details                                            |
| ---- | -------------------------------------------------- |
| 200  | User details are in the response                   |
| 401  | User is not auth'd or is not at a high enough role |
| 500  | Something went wrong server side                   |

### Update user

Updates user data by ID.

#### Update user Request

`PUT /user/:id`

##### Update user body

```js
{
  /**
   * New username for account
  */
  username: String,
  /**
   * New email address for account
  */
  email: String,
  /**
   * New password for account
  */
  password: String,
  /**
   * current password for account
   * this is only required to change own password
  */
  current_password: String,
  /**
   * New name for account
  */
  name: String,
  /**
   * New role for account
  */
  role: Number,
  /**
   * Add data of any format against a user
   * Setting an existing key to null will remove it
  */
  additionalFields: {
    [key]: any | null
  }
  /**
   * New status for account (0: inactive, 1: active)
  */
  status: Number
}
```

#### Update user Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success, new user object in response                              |
| 400  | Something is wrong with the data, response will have more details |
| 401  | User is not auth'd or is not at a high enough role                |
| 500  | Something went wrong server side                                  |

### Delete user

Either soft or hard deletes a user by ID.

#### Delete user Request

`DELETE /user/:id`

##### Delete user body

```js
{
  /**
   * DEFAULT: false
   * Should the account be fully removed or marked as deleted?
  */
  hard_delete: Boolean,
}
```

#### Delete user Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success                                                           |
| 400  | Something is wrong with the data, response will have more details |
| 401  | User is not auth'd or is not at a high enough role                |
| 500  | Something went wrong server side                                  |

### Get roles

Returns a list of all roles.

#### Get roles Request

`GET /roles`

#### Get roles Response

| Code | Details                          |
| ---- | -------------------------------- |
| 200  | Success, returns a list of roles |
| 500  | Something went wrong server side |

### GET specific role

Returns role data by role number.

#### GET specific role Request

`GET /role/:no`

#### GET specific role Response

| Code | Details                          |
| ---- | -------------------------------- |
| 200  | Success, returns role            |
| 500  | Something went wrong server side |

### Create role

Creates a role in the database.

#### Create role Request

`POST /role/`

##### Create role body

```js
{
  /**
   * Name for role
  */
  name: String,
  /**
   * Description for role
  */
  description : String,
  /**
   * Number for role
  */
  role : Number,
}
```

#### Create role Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success, role has been create                                     |
| 400  | Something is wrong with the data, response will have more details |
| 401  | User is not auth'd or is not at a high enough role                |
| 500  | Something went wrong server side                                  |

### Update role

Updates role data by role number.

#### Update role Request

`PUT /role/:no`

##### Update role body

```js
{
  /**
   * New name for role
  */
  name: String,
  /**
   * New description address for account
  */
  description : String,
}
```

#### Update role Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success, role has been updated                                    |
| 400  | Something is wrong with the data, response will have more details |
| 401  | User is not auth'd or is not at a high enough role                |
| 500  | Something went wrong server side                                  |

### Delete role

Removes role based on role number.

#### Delete role Request

`DELETE /role/:no`

#### Delete role Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success                                                           |
| 400  | Something is wrong with the data, response will have more details |
| 401  | User is not auth'd or is not at a high enough role                |
| 500  | Something went wrong server side                                  |

### Get key

Get a list of all owned api keys.

#### Get key Request

`GET /api-keys`
`POST /api-keys`

##### Get key body

```js
{
  /**
   * DEFAULT: Infinite
   * Total results per page
  */
  limit: String,
  /**
   * DEFAULT: 0
   * Page to show (starting at 0)
  */
  page: String,
}

```

#### Get key Response

| Code | Details                          |
| ---- | -------------------------------- |
| 200  | Success, receive list of keys    |
| 500  | Something went wrong server side |

### Get key query

Query all existing keys (Admin only).

#### Get key query Request

`POST /api-key/query`

##### Get key query body

```js
{
  /**
   * DEFAULT: Infinite
   * Total results per page
  */
  limit: String,
  /**
   * DEFAULT: 0
   * Page to show (starting at 0)
  */
  page: String,
  /**
   * all mongo queries are accepted in this request
  */
  [key]: any
}

```

#### Get key query Response

| Code | Details                          |
| ---- | -------------------------------- |
| 200  | Success, receive list of keys    |
| 500  | Something went wrong server side |

### Add key

Query all existing keys (Admin only).

#### Add key Request

`POST /api-key`

##### Add key body

```js
{
  /**
   * REQUIRED
   * Name for the new key
  */
  name: String,
  /**
   * Description for new key
  */
  description: String,
  /**
   * Default: User Role
   * Role for calls using this key
  */
  role: Number
}

```

#### Add key Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success, receive new key                                          |
| 400  | Something is wrong with the data, response will have more details |
| 500  | Something went wrong server side                                  |

### Get Specific key

Get a specific api-key (provided you are owner).

#### Get Specific key Request

`GET /api-key/:id`
`POST /api-key/:id`

##### Get Specific key body

```js
{
  /**
   * DEFAULT: Infinite
   * Total results per page
  */
  limit: String,
  /**
   * DEFAULT: 0
   * Page to show (starting at 0)
  */
  page: String,
}

```

#### Get Specific key Response

| Code | Details                          |
| ---- | -------------------------------- |
| 200  | Success, receive key             |
| 500  | Something went wrong server side |

### Update key

Update a specific api-key (provided you are owner or admin).

#### Update key Request

`PUT /api-key/:id`

##### Update key body

```js
/**
   * New name for key
  */
  name: String,
  /**
   * New description for key
  */
  description: String,
  /**
   * New role for key (must be lower than owners role)
  */
  role: Number

```

#### Update key Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success, receive updated key                                      |
| 400  | Something is wrong with the data, response will have more details |
| 500  | Something went wrong server side                                  |

### Delete key

Remove a specific api-key (provided you are owner or admin).

#### Delete key Request

`DELETE /api-key/:id`

#### Delete key Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success                                                           |
| 400  | Something is wrong with the data, response will have more details |
| 500  | Something went wrong server side                                  |

### Gen key

Generate a new token for a specific key.

#### Gen key Request

`POST /api-key/gen/:id`

##### Gen key body

```js
  /**
   * total life of new token (in seconds)
   * defaults to 7 days
  */
  life: Number,
```

#### Gen key Response

| Code | Details                                                           |
| ---- | ----------------------------------------------------------------- |
| 200  | Success                                                           |
| 400  | Something is wrong with the data, response will have more details |
| 500  | Something went wrong server side                                  |

## Authentication from other Microservices

You can use the `/auth` end point to authenticate that a user has the right to access a set API endpoint
by using [fetch](https://www.npmjs.com/package/node-fetch) to check request confirmation internally.

Here is a sample of how to achieve a lookup.

```js
// get the cookie from the header or look for a token
const { cookie } = req.headers;
const cookieToken = cookie?.split('; ')?.find((c) => /^AuthToken=.*$/.test(c));
const authToken = cookieToken ? cookieToken.split('=')[1] : req.headers['token'];

// if there is no token give up
if (!authToken) return false;

const result = await fetch('http://10.0.10.26:3000/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    token: authToken,
  },
  // only users with a role 1 or lower will return successfully
  body: JSON.stringify({ role: 1 }),
});

const json = await result.json();

if (!json.success) false;

return json;
```

## Getting started

Duplicate the sample.env and rename the duplicate to .env

Configure your environment file.

Install the node modules using `npm i`.

To run the tests, use `npm test`.

To run in development, use `npm run dev`.

To run in production, use `npm start`.

To run inside docker, use `docker-compose up -d`.

## Pushing to GitLab

Every time you push your changes to GitLab, GitLab will automatically begin executing the tests to ensure that no changes have caused any issues. Please ensure that the tests pass prior to pushing to GitLab, and if any issues arise, fix them as soon as possible.
