const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const multer  = require('multer');
const upload = multer({ storage: multer.memoryStorage() })

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'viberz',
    password: ''
});

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

let user;

app.listen(3000, function () {
    console.log("App listening");
})

// =====================================================
//              LOGIN & HOME SECTION
// =====================================================
app.get("/", (req, res) => {
    res.render("login.ejs");
})
app.get("/sign_up", (req, res) => {
    res.render("sign-up.ejs");
})

app.post("/sign_up", (req, res) => {
    let { username, email, password } = req.body;
    let data = [`${username}`, `${email}`, `${password}`];
    let q = `SELECT * FROM all_users WHERE username = '${username}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            if (result.length !== 0) {
                res.send("Username Already Exists")
            }
            else {
                let q1 = `INSERT INTO all_users VALUES(?, ?, ?)`;
                let q2 = `CREATE TABLE ${username} (id VARCHAR(50) PRIMARY KEY, content TEXT, image LONGTEXT)`;
                try {
                    connection.query(q1, data, (err, result) => {
                        if (err) throw err;
                        user = username;
                    })

                    connection.query(q2, (err, result) => {
                        if (err) throw err;
                        res.redirect("/home");
                    })

                } catch (err) {
                    console.log(err);
                    res.send("Some Error in DB");
                }
            }
        })
    } catch (err) {
        console.log(err);
    }

})

app.post("/login", (req, res) => {
    let { username, password } = req.body;
    let q = `SELECT * FROM all_users WHERE username='${username}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            // if(result.length == 0) {
            //     res.send("No Such User")
            // }
            if (password != result[0]["password"]) {
                res.send("Wrong Password !");
            }
            else {
                user = username;
                res.redirect("/home");
            }
        })
    } catch (err) {
        console.log("SOME ERROR IN DB");
    }
})
// HOME
app.get("/home", (req, res) => {
    let q = `SELECT * FROM all_posts ORDER BY date DESC`;
    try {
        connection.query(q, (err, result)=>{
            if(err) throw err;
            let posts = result;
            res.render("index.ejs", { posts, user });
        })
    } catch (err) {
        console.log(err);
        res.send("Some Error in DB");
    }
})

// ======================================================
//             CONTACT & ABOUT SECTION
// ======================================================
app.get("/contact", (req, res) => {
    res.render("contact.ejs");
})
app.post("/contact", (req, res)=>{
    let {name, email, message} = req.body;
    let q = `INSERT INTO contact VALUES(null, ?, ?, ?)`;
    try {
        connection.query(q, [name, email, message], (err, result)=>{
            if (err) throw err;
            res.send("Message Received");
        })
    } catch (error) {
        console.log(err);
        res.send("Message not received!\nSome Error In DB");
    }
})
app.get("/about", (req, res) => {
    res.render("about.ejs", { user });
})

// ======================================================
//              MY POSTS SECTION
// ======================================================
app.get("/home/my_posts", (req, res) => {
    let q = `SELECT * FROM ${user}`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let posts = result;
            res.render("my_posts.ejs", { posts, user });
        })
    } catch (err) {
        res.send("Some Error in DB")
    }
})

app.get("/home/my_posts/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM ${user} WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let post = result[0];
            res.render("edit.ejs", { post, user });
        })
    } catch (err) {
        res.send("Some Error In DB");
    }
})

// EDIT Post 
app.patch("/home/my_posts/:id", (req, res) => {
    let { id } = req.params;
    let { content } = req.body;
    let q = `UPDATE ${user} SET content='${content}' WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.redirect("/home/my_posts");
        })
    } catch (err) {
        res.send("Some Error in DB");
    }
})

// DELETE POST 
app.delete("/home/my_posts/:id", (req, res) => {
    let { id } = req.params;
    let q1 = `DELETE FROM ${user} WHERE id='${id}'`;
    let q2 = `DELETE FROM all_posts WHERE id='${id}';`
    try {
        connection.query(q1, (err, result) => {
            if (err) throw err;
        })

        connection.query(q2, (err, result) => {
            if (err) throw err;
            res.redirect("/home/my_posts");
        })

    } catch (err) {
        res.send("Some Error in DB");
    }
})

app.get("/home/:id/details", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM all_posts WHERE id='${id}'`;
    try{
        connection.query(q, (err, result)=>{
            let post = result[0];
            res.render("post_details.ejs", { user, post });
        })
    } catch (err) {
        console.log(err);
        res.send("Some Error in DB");
    }
})


// NEW Post
app.get("/home/new", (req, res) => {
    res.render("new_post.ejs", { user });
})

app.post("/home/my_posts", upload.single('image'), (req, res) => {
    let image = req.file.buffer.toString('base64');
    let content = req.body.content;
    let id = uuidv4();

    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${year}-${month}-${day}`;

    let data = [`${id}`, `${user}`, `${content}`, `${image}`, `${currentDate}`];
    let q1 = `INSERT INTO all_posts VALUES(?, ?, ?, ?, ?)`;
    let q2 = `INSERT INTO ${user} VALUES (?, ?, ?)`
    try {
        connection.query(q1, data, (err, result) => {
            if (err) throw err;
        })
        connection.query(q2, [`${id}`, `${content}`, image], (err, result) => {
            if (err) throw err;
            res.redirect("/home/my_posts");
        })
    } catch (err) {
        console.log(err);
        res.send("Some Error in DB");
    }
    // res.send("posting...")
})