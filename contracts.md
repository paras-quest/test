# Notes App Contract

## API Contracts

### Note Model
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "color": "string",
  "createdAt": "ISO string"
}
```

### Endpoints

- **GET /api/notes**
  - Response: `Note[]`
- **POST /api/notes**
  - Request: `{ title: string, content: string, color: string }`
  - Response: `Note`
- **PUT /api/notes/{id}**
  - Request: `{ title: string, content: string, color: string }`
  - Response: `Note`
- **DELETE /api/notes/{id}**
  - Response: `{ status: "success" }`

## Data Mocked in mock.js
- Initial set of 3 notes (Project Ideas, Grocery List, Meeting Notes)
- Temporary IDs generated via `Math.random()`
- `createdAt` timestamps generated in browser

## Backend Implementation
- MongoDB collection: `notes`
- FastAPI endpoints for CRUD operations
- Pydantic models for request/response validation
- Error handling for missing notes or DB issues

## Integration Plan
1. Implement FastAPI server with MongoDB routes
2. Update frontend `Index.tsx` to use `fetch()` with `API_URL`
3. Remove `mock.js` dependency
4. Add loading states and error toasts for network requests
