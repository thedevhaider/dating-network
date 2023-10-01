# A Dating Network

# Routes
1. GET  /:profile_id - To Render Profile page with the given profile_id
2. POST /api/profile - To Create Profile
3. POST /api/users/register - To Register a user
4. GET /api/users/:user_id - To Get a User from ID
5. GET /api/users - To List Registered users
6. POST /api/votes - To Vote on a Porfile
7. POST /api/votes/like/:vote_id - To Like a Vote
8. POST /api/votes/unlike/:vote_id - To UnLike a Vote
9. GET /api/votes - To List All Votes based on provided filters

# Setup Guide

To setup the project please follow these guidelines

1. Make sure that you have nodejs and npm installed in your system.
2. Run command 'npm install' in the project root directory to install all the dependencies from the package.json file.
3. Run 'npm run server' in the root to run the nodejs server.
4. You don't need a database server as using in-memory server for the ease of testing
5. Refer to this Postman collection for testing the endpoints /Boo.postman_collection.json

Don't forget to Star and Fork the repository.

Have fun!
