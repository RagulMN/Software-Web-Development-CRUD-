const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path'); // Required for serving files
require("dotenv").config();//call env file
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const csrf = require('csurf');
const bcrypt = require('bcrypt');
const createDOMPurify = require('dompurify');
const csrfProtection = csrf({ cookie: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// MySQL connection configuration
const db = mysql.createConnection({
    host: "localhost",
    user: process.env.sql_user,
    password: process.env.sql_password,
    database: "mydb"
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.use(session({
    secret: process.env.SESSION_SECRET, // secret key imported from .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST request to add a new user
const saltRounds = 10;

app.post('/users',  (req, res) => {
    const user = req.body;
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        user.password = hash;
        const sql = 'INSERT INTO users SET ?';
        db.query(sql, user, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error adding user');
            } else {
                res.status(201).json(user);
            }
        });
    });
});
//============================Login check=====================================
// POST request to handle login
app.post('/login',  (req, res) => {
    const { email, password } = req.body;

    // Query to check user credentials and retrieve role
    const sql = 'SELECT email, password, role FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error during login.');
        } else if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, function(err, result) {
                if (result) {
                    // Password matches, proceed with login
                    if (user.role === 'admin') {
                        res.json({ url: '/admin.html', role: 'admin' });
                    } else {
                        res.json({ url: '/user.html', role: 'user' });
                    }
                } else {
                    res.status(401).send('Credentials incorrect or user does not exist.');
                }
            });
        } else {
            res.status(401).send('Credentials incorrect or user does not exist.');
        }
    });
});


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  
  // Apply the rate limiting middleware to all routes
  app.use(limiter);
  
// Route handler for GET requests to the login path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Route handler for GET requests to the root path
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

//=================================ADMIN CRUD===================
//Create (Add New info)
app.post('/info', (req, res) => {
    console.log(req.body); // Log the body to see what you're getting from the front end
    const { name, age, city, email, phone, post, start_date } = req.body;

    if (!name || !email) {  // Basic validation
        res.status(400).send('Missing required fields.');
        return;
    }

    const sql = 'INSERT INTO info (name, age, city, email, phone, post, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, age, city, email, phone, post, start_date], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error adding information to the database');
        } else {
            res.status(201).send('Information added successfully');
        }
    });
});



//Read(Get Info)
app.get('/info', (req, res) => {
    const sql = 'SELECT * FROM info';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving users from info table');
        } else {
            res.json(results);
        }
    });
});


// Update (info) - Only update non-empty fields
app.put('/info/:id', (req, res) => {
    const { id } = req.params;
    let updates = [];
    let values = [];

    Object.entries(req.body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            updates.push(`${key} = ?`);
            values.push(value);
        } else if (value === null && key === 'start_date') {
            updates.push(`${key} = NULL`);  // Handle NULL for start_date explicitly
        }
    });

    if (updates.length > 0) {
        const sql = `UPDATE info SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id); // Add the ID to the values array for the parameterized query

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error updating user in info table');
            } else {
                res.send('User updated successfully in info table');
            }
        });
    } else {
        res.status(400).send('No valid fields provided for update.');
    }
});

//Detele(info)
app.delete('/info/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM info WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting user from info table');
        } else {
            res.send('User deleted successfully from info table');
        }
    });
});
//=================================================================
// POST request to handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query to check user credentials and retrieve role
    const sql = 'SELECT email, role FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error during login.');
        } else if (results.length > 0) {
            const user = results[0];
            // Respond with a URL based on the user's role
            if (user.role === 'admin') {
                res.json({ url: '/admin.html' });  // Redirect to admin page
            } else {
                res.json({ url: '/user.html' });  // Redirect to user page
            }
        } else {
            res.status(401).send('Credentials incorrect or user does not exist.');
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
