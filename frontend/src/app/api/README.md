# API Routes

This directory contains the API routes for the Mercoa Take-Home project. These routes are implemented using Next.js App Router API routes and mirror the functionality of the backend express.ts file.

## Available Routes

### `POST /api/login`
Authenticate a user or create a new user.
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ email: string }` or `{ email: "incorrect" }` if password is wrong

### `POST /api/customer_entity`
Get or create a customer entity.
- **Request Body**: `{ email: string, firstName: string, lastName: string, middleName?: string, suffix?: string }`
- **Response**: `{ entityId: string }`

### `POST /api/find_entity`
Find a business entity by email.
- **Request Body**: `{ email: string }`
- **Response**: `{ entityId: string }` or `{ entityId: "UNDEFINED" }` if not found

### `POST /api/business_entity`
Create a business entity.
- **Request Body**: Contains business information like legal name, address, contact info, etc.
- **Response**: `{ entityId: string }` or `{ entityId: "UNDEFINED" }` if creation failed

### `POST /api/get_invoice`
Get invoices for an entity.
- **Request Body**: `{ entityId: string }`
- **Response**: `{ invoices: { data: Invoice[], count: number } }`

### `POST /api/invoice`
Create a new invoice.
- **Request Body**: `{ entityId: string, amount: number }`
- **Response**: `{ invoiceId: string }` or `{ invoiceId: null, error: string }` if creation failed

## Implementation Details

These API routes use a mock implementation of the Mercoa JavaScript SDK defined in `src/lib/mercoa-mock.ts`. In a real application, these would connect to a real backend or database. 