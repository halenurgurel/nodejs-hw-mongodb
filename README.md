# Node.js MongoDB - Contacts API with Authentication

A RESTful API for managing contacts with JWT-based authentication, built with Node.js, Express, and MongoDB (Mongoose).

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

| Variable                | Description                              | Example                          |
| ----------------------- | ---------------------------------------- | -------------------------------- |
| `PORT`                  | Port the server listens on               | `3000`                           |
| `MONGODB_USER`          | MongoDB Atlas username                   | `myuser`                         |
| `MONGODB_PASSWORD`      | MongoDB Atlas password                   | `mypassword`                     |
| `MONGODB_URL`           | MongoDB Atlas cluster URL                | `cluster0.xxxxx.mongodb.net`     |
| `MONGODB_DB`            | MongoDB database name                    | `contacts-db`                    |
| `SMTP_HOST`             | Brevo SMTP host                          | `smtp-relay.brevo.com`           |
| `SMTP_PORT`             | Brevo SMTP port                          | `587`                            |
| `SMTP_USER`             | Brevo SMTP login email                   | `your@email.com`                 |
| `SMTP_PASSWORD`         | Brevo SMTP key                           | `xsmtpsib-...`                   |
| `SMTP_FROM`             | Sender email (registered on Brevo)       | `your@email.com`                 |
| `JWT_SECRET`            | Secret key for signing JWT tokens        | `VOQjLdrpG1TWCHhDzv3o`           |
| `APP_DOMAIN`            | Frontend domain for reset password link  | `http://localhost:3000/auth`     |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                    | `mycloud`                        |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                       | `123456789`                      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                    | `abc123...`                      |

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
├── index.js                    # Entry point — connects DB then starts server
├── server.js                   # Express app setup and route mounting
├── db/
│   ├── initMongoConnection.js  # Mongoose connection logic
│   └── models/
│       ├── contact.js          # Contact Mongoose model
│       ├── user.js             # User Mongoose model
│       └── session.js          # Session Mongoose model
├── controllers/
│   ├── contacts.js             # Contact route handler functions
│   └── auth.js                 # Auth route handler functions
├── routers/
│   ├── contacts.js             # Express router — defines all /contacts routes
│   └── auth.js                 # Express router — defines all /auth routes
├── middlewares/
│   ├── authenticate.js         # Bearer token authentication middleware
│   ├── validateBody.js         # Joi request body validation middleware
│   ├── isValid.js              # MongoDB ObjectId validation middleware
│   ├── upload.js               # Multer middleware for multipart/form-data file uploads
│   ├── notFoundHandler.js      # 404 handler for unknown routes
│   └── errorHandler.js         # Global error handler
├── services/
│   ├── contacts.js             # Contact database query functions
│   └── auth.js                 # Auth database query functions
├── templates/
│   └── reset-password-email.html # Handlebars email template for password reset
├── temp/                       # Temporary folder for multer file uploads
├── constants/
│   └── index.js                # Shared constants (SORT_ORDER, FIFTEEN_MINUTES, THIRTY_DAYS, FIVE_MINUTES, TEMPLATES_DIR, TEMP_UPLOAD_DIR)
├── validation/
│   ├── contacts.js             # Joi validation schemas for contacts
│   └── auth.js                 # Joi validation schemas for auth
└── utils/
    ├── env.js                  # Helper to read environment variables
    ├── ctrlWrapper.js          # Wraps controllers with try/catch error handling
    ├── parsePaginationParams.js # Parses page and perPage from query string
    ├── calculatePaginationData.js # Calculates totalPages, hasPreviousPage, hasNextPage
    ├── parseSortParams.js      # Parses and validates sortBy and sortOrder
    ├── parseFilterParams.js    # Parses and validates type and isFavourite filters
    ├── sendMail.js             # Nodemailer transporter for sending emails via Brevo SMTP
    ├── cloudinary.js           # Cloudinary configuration
    └── saveFileToCloudinary.js # Uploads a file to Cloudinary and returns the URL
```

## Authentication

All `/contacts` routes are protected and require a valid Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Access tokens expire after **15 minutes**. Use `POST /auth/refresh` to get a new one using the refresh token stored in cookies.

---

## Auth Endpoints

### POST /auth/register

Registers a new user.

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`:**

```json
{
  "status": 201,
  "message": "Successfully registered a user!",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response `409` (email already in use):**

```json
{
  "message": "Email in use"
}
```

---

### POST /auth/login

Logs in a user. Sets `refreshToken` and `sessionId` as `httpOnly` cookies and returns the `accessToken` in the response body.

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully logged in an user!",
  "data": {
    "accessToken": "<token>"
  }
}
```

**Response `401` (invalid credentials):**

```json
{
  "message": "Unauthorized"
}
```

---

### POST /auth/refresh

Refreshes the session using the `refreshToken` cookie. Issues a new access token and rotates the refresh token.

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully refreshed a session!",
  "data": {
    "accessToken": "<newToken>"
  }
}
```

**Response `401` (session not found or token expired):**

```json
{
  "message": "Session not found"
}
```

---

### POST /auth/logout

Logs out the user by deleting the session and clearing cookies.

**Response `204`:** No content.

---

### POST /auth/send-reset-email

Sends a password reset email to the user with a JWT-signed link valid for 5 minutes.

**Request body:**

```json
{
  "email": "john@example.com"
}
```

**Response `200`:**

```json
{
  "status": 200,
  "message": "Reset password email has been successfully sent.",
  "data": {}
}
```

**Response `404` (user not found):**

```json
{
  "message": "User not found!"
}
```

**Response `500` (email failed to send):**

```json
{
  "message": "Failed to send the email, please try again later."
}
```

---

### POST /auth/reset-pwd

Resets the user's password using the JWT token from the reset email. Also deletes the user's current session.

**Request body:**

```json
{
  "token": "<jwt-token-from-email>",
  "password": "newpassword123"
}
```

**Response `200`:**

```json
{
  "status": 200,
  "message": "Password has been successfully reset.",
  "data": {}
}
```

**Response `401` (expired or invalid token):**

```json
{
  "message": "Token is expired or invalid."
}
```

**Response `404` (user not found):**

```json
{
  "message": "User not found!"
}
```

---

## Contact Endpoints

All contact endpoints require `Authorization: Bearer <accessToken>` header. Users can only access their own contacts.

### GET /contacts

Returns a paginated, sortable, and filterable list of the authenticated user's contacts.

**Query Parameters:**

| Parameter     | Type    | Default     | Description |
|---------------|---------|-------------|-------------|
| `page`        | number  | `1`         | Page number |
| `perPage`     | number  | `10`        | Items per page |
| `sortBy`      | string  | `_id`       | Sort field: `name`, `email`, `phoneNumber`, `contactType`, `isFavourite`, `createdAt`, `updatedAt` |
| `sortOrder`   | string  | `asc`       | Sort direction: `asc` or `desc` |
| `type`        | string  | —           | Filter by contact type: `work`, `home`, `personal` |
| `isFavourite` | boolean | —           | Filter by favourite: `true` or `false` |

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully found contacts!",
  "data": {
    "data": [...],
    "page": 1,
    "perPage": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

### GET /contacts/:contactId

Returns a single contact by ID (must belong to the authenticated user).

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully found contact with id <contactId>",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "isFavourite": false,
    "contactType": "personal",
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response `404`:**

```json
{
  "message": "Contact not found"
}
```

---

### POST /contacts

Creates a new contact for the authenticated user. Supports optional photo upload via `multipart/form-data`.

**Request body (`multipart/form-data`):**

| Field         | Type   | Required |
|---------------|--------|----------|
| `name`        | text   | Yes      |
| `phoneNumber` | text   | Yes      |
| `email`       | text   | No       |
| `isFavourite` | text   | No       |
| `contactType` | text   | No       |
| `photo`       | file   | No       |

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
    "photo": "https://res.cloudinary.com/...",
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### PATCH /contacts/:contactId

Partially updates a contact. Supports optional photo upload via `multipart/form-data`. Only send the fields you want to change. If no photo is sent, the existing photo is preserved.

**Request body (`multipart/form-data`, example):**

| Field  | Type | Required |
|--------|------|----------|
| `name` | text | No       |
| `photo`| file | No       |

**Response `200`:**

```json
{
  "status": 200,
  "message": "Successfully patched a contact!",
  "data": { ... }
}
```

**Response `404`:**

```json
{
  "message": "Contact not found"
}
```

---

### DELETE /contacts/:contactId

Deletes a contact by ID.

**Response `204`:** No content.

**Response `404`:**

```json
{
  "message": "Contact not found"
}
```

---

## Models

### User

| Field      | Type   | Required | Notes              |
|------------|--------|----------|--------------------|
| `name`     | String | Yes      |                    |
| `email`    | String | Yes      | Must be unique     |
| `password` | String | Yes      | Stored as bcrypt hash |

### Session

| Field                   | Type     | Required | Notes                        |
|-------------------------|----------|----------|------------------------------|
| `userId`                | ObjectId | Yes      | Reference to User            |
| `accessToken`           | String   | Yes      | Expires in 15 minutes        |
| `refreshToken`          | String   | Yes      | Expires in 30 days           |
| `accessTokenValidUntil` | Date     | Yes      |                              |
| `refreshTokenValidUntil`| Date     | Yes      |                              |

### Contact

| Field         | Type     | Required | Default      | Notes                            |
|---------------|----------|----------|--------------|----------------------------------|
| `name`        | String   | Yes      | —            |                                  |
| `phoneNumber` | String   | Yes      | —            |                                  |
| `email`       | String   | No       | —            |                                  |
| `isFavourite` | Boolean  | No       | `false`      |                                  |
| `contactType` | String   | Yes      | `"personal"` | Enum: `work`, `home`, `personal` |
| `photo`       | String   | No       | —            | Cloudinary URL                   |
| `userId`      | ObjectId | Yes      | —            | Reference to User                |
| `createdAt`   | Date     | —        | auto         | Auto-generated by `timestamps`   |
| `updatedAt`   | Date     | —        | auto         | Auto-generated by `timestamps`   |

---

## Dependencies

| Package        | Purpose                                        |
|----------------|------------------------------------------------|
| `express`      | Web framework                                  |
| `mongoose`     | MongoDB ODM                                    |
| `bcrypt`       | Password hashing                               |
| `cookie-parser`| Cookie parsing middleware                      |
| `http-errors`  | HTTP error creation                            |
| `joi`          | Request body validation                        |
| `dotenv`       | Environment variable loading                   |
| `cors`         | Cross-origin resource sharing                  |
| `pino-http`    | HTTP request logging                           |
| `nodemailer`   | Sending emails via SMTP (Brevo)                |
| `jsonwebtoken` | Signing and verifying JWT tokens               |
| `handlebars`   | HTML email templating                          |
| `multer`       | Handling multipart/form-data file uploads      |
| `cloudinary`   | Uploading and storing images in the cloud      |

## Dev Dependencies

| Package       | Purpose                   |
|---------------|---------------------------|
| `nodemon`     | Auto-restart on file save |
| `pino-pretty` | Pretty log formatting     |
| `eslint`      | Code linting              |
