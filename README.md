# SmartVote

SmartVote is a MERN stack application that allows users to participate in university-level elections. Users can register as voters or candidates, while admins can schedule elections and declare results.

## Features

- **User Registration & Authentication**: Users can sign up as voters or candidates.
- **Admin Dashboard**: Admins can schedule elections and declare results.
- **Vote Casting**: Registered voters can cast their votes in active elections.
- **Live Election Status**: Elections are dynamically updated based on start and end dates.
- **Result Declaration**: Admins can publish election results after voting ends.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Deployment**: Render (or any other hosting service used)

## Installation

### Prerequisites
- Node.js & npm installed
- MongoDB instance running (local or cloud)

### Steps to Run

1. **Clone the repository:**
   ```sh
   git clone https://github.com/sujalmendhe02/smartvote.git
   cd smartvote
   ```

2. **Install dependencies:**
   ```sh
   npm install
   cd client && npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the backend server:**
   ```sh
   npm run dev
   ```

5. **Start the frontend:**
   ```sh
   cd client
   npm run dev
   ```

## API Endpoints

| Method | Endpoint            | Description                   |
|--------|---------------------|-------------------------------|
| POST   | /ap/register        | Register a new user          |
| POST   | /api/login          | Login user                    |
| GET    | /api/elections      | Get all elections             |
| POST   | /api/vote           | Cast a vote                   |
| GET    | /api/results        | View election results         |

## Contributing

Feel free to submit issues and pull requests to improve the project!

## License

This project is licensed under the MIT License.
