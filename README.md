# Node.js MongoDB - CRUD

A RESTful API for managing contacts, built with Node.js, Express, and MongoDB (Mongoose).

## Requirements

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB instance)

## Getting Started

### 1. Clone the repository

```bash
git clone github.com/halenurgurel/nodejs-hw-mongodb
cd nodejs-hw-mongodb
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable           | Description                | Example                      |
| ------------------ | -------------------------- | ---------------------------- |
| `PORT`             | Port the server listens on | `3000`                       |
| `MONGODB_USER`     | MongoDB Atlas username     | `myuser`                     |
| `MONGODB_PASSWORD` | MongoDB Atlas password     | `mypassword`                 |
| `MONGODB_URL`      | MongoDB Atlas cluster URL  | `cluster0.xxxxx.mongodb.net` |
| `MONGODB_DB`       | MongoDB database name      | `contacts-db`                |

### 4. Start the development server

```bash
npm run dev
```

You should see:

```
Mongo connection successfully established
Server is running on port 3000
```

## Project Structure

```
src/
├── index.js                  # Entry point — connects DB then starts server
├── server.js                 # Express app setup and route mounting
├── db/
│   ├── initMongoConnection.js  # Mongoose connection logic
│   └── models/
│       └── contact.js          # Contact Mongoose model
├── controllers/
│   └── contacts.js             # Route handler functions
├── routers/
│   └── contacts.js             # Express router — defines all /contacts routes
├── middlewares/
│   ├── notFoundHandler.js      # 404 handler for unknown routes
│   └── errorHandler.js         # Global error handler
├── services/
│   └── contacts.js             # Database query functions
├── constants/
│   └── index.js                # Shared constants (SORT_ORDER)
├── validation/
│   └── contacts.js             # Joi validation schemas
└── utils/
    ├── env.js                  # Helper to read environment variables
    ├── ctrlWrapper.js          # Wraps controllers with try/catch error handling
    ├── parsePaginationParams.js # Parses page and perPage from query string
    ├── calculatePaginationData.js # Calculates totalPages, hasPreviousPage, hasNextPage
    ├── parseSortParams.js      # Parses and validates sortBy and sortOrder
    └── parseFilterParams.js    # Parses and validates type and isFavourite filters
```

## API Endpoints

### GET /contacts

Returns a paginated, sortable, and filterable list of contacts.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `perPage` | number | `10` | Items per page |
| `sortBy` | string | `_id` | Sort field: `name`, `email`, `phoneNumber`, `contactType`, `isFavourite`, `createdAt`, `updatedAt` |
| `sortOrder` | string | `asc` | Sort direction: `asc` or `desc` |
| `type` | string | — | Filter by contact type: `work`, `home`, `personal` |
| `isFavourite` | boolean | — | Filter by favourite: `true` or `false` |

**Example request:**
```
GET /contacts?page=2&perPage=4&sortBy=name&sortOrder=asc&type=work&isFavourite=true
```

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully found contacts!",
  "data": {
    "data": [
      {
        "_id": "...",
        "name": "John Doe",
        "phoneNumber": "+1234567890",
        "email": "john@example.com",
        "isFavourite": true,
        "contactType": "work",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "page": 2,
    "perPage": 4,
    "totalItems": 6,
    "totalPages": 2,
    "hasPreviousPage": true,
    "hasNextPage": false
  }
}
```

---

### GET /contacts/:contactId

Returns a single contact by ID.

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully found contact with id <contactId>!",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "isFavourite": false,
    "contactType": "personal",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response `404` (contact not found):**

```json
{
  "message": "Contact not found"
}
```

---

### POST /contacts

Creates a new contact.

**Request body:**

```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "isFavourite": false,
  "contactType": "personal"
}
```

**Response `201`:**

```json
{
  "status": 201,
  "message": "Successfully created a contact",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "isFavourite": false,
    "contactType": "personal",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH /contacts/:contactId

Partially updates an existing contact. Only send the fields you want to change.

**Request body (example):**

```json
{
  "email": "newemail@example.com"
}
```

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully patched a contact!",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "newemail@example.com",
    "isFavourite": false,
    "contactType": "personal",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response `404` (contact not found):**

```json
{
  "message": "Contact not found"
}
```

---

### DELETE /contacts/:contactId

Deletes a contact by ID.

**Response `204`:** No content.

**Response `404` (contact not found):**

```json
{
  "message": "Contact not found"
}
```

## Contact Model

| Field         | Type    | Required | Default      | Notes                            |
| ------------- | ------- | -------- | ------------ | -------------------------------- |
| `name`        | String  | Yes      | —            |                                  |
| `phoneNumber` | String  | Yes      | —            |                                  |
| `email`       | String  | No       | —            |                                  |
| `isFavourite` | Boolean | No       | `false`      |                                  |
| `contactType` | String  | Yes      | `"personal"` | Enum: `work`, `home`, `personal` |
| `createdAt`   | Date    | —        | auto         | Auto-generated by `timestamps`   |
| `updatedAt`   | Date    | —        | auto         | Auto-generated by `timestamps`   |

## Dependencies

| Package     | Purpose                       |
| ----------- | ----------------------------- |
| `express`   | Web framework                 |
| `mongoose`  | MongoDB ODM                   |
| `dotenv`    | Environment variable loading  |
| `cors`      | Cross-origin resource sharing |
| `pino-http` | HTTP request logging          |

## Dev Dependencies

| Package       | Purpose                   |
| ------------- | ------------------------- |
| `nodemon`     | Auto-restart on file save |
| `pino-pretty` | Pretty log formatting     |
| `eslint`      | Code linting              |
