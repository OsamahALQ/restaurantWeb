# Welcome to my resturant website! 

### Content summary
- Installing modules
- Demo the finished product
- Setting up MongoDB
- Working with Mongo
    - Use of the daemon
    - Initializing the database with the initializer js file
- Mongoose schemas and validation

### Solution demo
- Go over specification, answer questions, READ MONGODB USAGE WARNING
- Navigation header
    - To be included in all pages (pug)
    - Changes depending on current session state (login vs. logout)
        - Client is logged in?  -> Home / Users / Order / Profile / (A method for logout)
        - Client is not logged? -> Home / Users / Registration / (A method for login)
    - What happens when a client requests the "/order" or "/profile" page but hasn't logged in?
- User Registration
    - Provide a registration form, user should provide username and password to create account
    - New profiles' privacy default is "public"
    - Duplicate usernames are not allowed
    - Success -> Log user in (save session data) & redirect to user profile page
    - Failure -> Display error message & do not redirect
- User directory
    - Query the users collection, display results in html page, allow 'name' query parameter
    - Only 'public' profiles should match the query
    - Query should be case insensitive, eg. users?name="m" should show "madaline", "merrill" and "leoma"
    - Private users should not be part of results
- User profile page
    - Private profiles are only visible to owner
    - Public profiles are visible to all users
    - Users viewing own profile should be able to change privacy setting
- Order summary page
    - Displays order information
    - Visible if user that placed order is public
    - Visible if user is viewing it's own order
- Order Form and Submission
    - Only viewable for logged in users
    - Allows user to send order to server
    - Server should store orders in database

### EXAMPLE: Set of routes you could support
    - GET '/'
    - GET '/users?name=abc', POST '/users'
    - GET '/users/:userid'
    - GET '/orderform'
    - GET '/orders', POST '/orders'
    - GET '/orders/:orderid'
    - GET '/login', POST '/login'
    - GET '/logout'

### Installation
- Create package.json with npm init
- Recommendation: nodemon as a dev dependency (view previous workshop videos for more details)
- Modules you should include:
    - express
    - express-session
    - mongodb/mongoose
    - connect-mongo

### MongoDB setup
- Have the daemon running `mongod --dbpath="database"`
- Database initializer script
    - Review **BASE_CODE** provided (database-initializer.js)
    - Mongoose users: might need to add code to init script
- Setting up MongoDBStore and sessions

### Working with Mongo
- Asynchronous nature of queries
    - CRUD Operations are asynchronous!!!
- Query objects
    - specifications (&and, &lte, &gte)
- **COMMON MISTAKE** Mixing strings and MongoID

### Sessions
- Authentication and Authorization
- How to handle unauthorized paths
    - Setting up middleware to check paths
    - Difference between 403 status and 401 status
- Exposing session data with res.locals
- Conditionals with Pug and sessions

### Code Quality and Documentation
- Variable names
- Comments
- Functions
- ID names 
- README.txt

### Resources
- [SETUP: Express Session](https://expressjs.com/en/resources/middleware/session.html)
- [SETUP: MongoDB Session Store](https://www.npmjs.com/package/connect-mongo#connection-to-mongodb)
- [Express Documentation](https://expressjs.com/)
- [MongoDB CRUD queries](https://docs.mongodb.com/manual/tutorial/query-documents/)
- [Mongooose Documentation](https://mongoosejs.com/docs/guides.html)
- [HTTP status codes info](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [HTTP status codes list](https://www.restapitutorial.com/httpstatuscodes.html)
