const express = require('express');
const app = express();
const PORT = 8000;

//Routers
const posts = require('./routes/posts');
const users = require('./routes/users');

// Body-parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

// Logger Middleware
// New logging middleware to help us keep track of
// requests during testing!
app.use((req, res, next) => {
    const time = new Date();

    console.log(
        `-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
    );
    if (Object.keys(req.body).length > 0) {
        console.log('Containing the data:');
        console.log(`${JSON.stringify(req.body)}`);
    }
    next();
});

// Valid API Keys.
const apiKeys = ['perscholas', 'ps-example', 'hJAsknw-L198sAJD-l3kasx'];

// New middleware to check for API keys!
// Note that if the key is not verified,
// we do not call next(); this is the end.
// This is why we attached the /api/ prefix
// to our routing at the beginning!
app.use('/api', function (req, res, next) {
    const key = req.query['api-key'];

    // Check for the absence of a key.
    if (!key) {
        res.status(400);
        return res.json({ error: 'API Key Required' });
    }

    // Check for key validity.
    if (apiKeys.indexOf(key) === -1) {
        res.status(401);
        return res.json({ error: 'Invalid API Key' });
    }

    // Valid key! Store it in req.key for route access.
    req.key = key;
    next();
});

// Use our Routes
app.use('/api/users', users);
app.use('/api/posts', posts);

app.get('/', (req, res) => {
    res.json({
        links: [
            {
                href: '/api',
                rel: 'api',
                type: 'GET',
            },
        ],
    });
});

// Adding some HATEOAS links.
app.get('/api', (req, res) => {
    res.json({
        links: [
            {
                href: 'api/users',
                rel: 'users',
                type: 'GET',
            },
            {
                href: 'api/users',
                rel: 'users',
                type: 'POST',
            },
            {
                href: 'api/posts',
                rel: 'posts',
                type: 'GET',
            },
            {
                href: 'api/posts',
                rel: 'posts',
                type: 'POST',
            },
        ],
    });
});
// Custom 404 (not found) middleware.
// Since we place this last, it will only process
// if no other routes have already sent a response!
// We also don't need next(), since this is the
// last stop along the request-response cycle.
app.use((req, res, next) => {
    res.status(404).json({ error: 'Resource Not Found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});




