const express = require("express");
const fs = require("fs").promises; // promised-based version of node fs
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

// Receives the code from the frontend + handles the osu! API requests for getting userdata and reading the database
app.post("/code_transfer", async (req, res) => {
    const { code } = req.body;

    // Sends HTTP response 400 if code's value is null and exits the function
    if (!code) {
        return res.status(400).send({ error: "code not received" });
    }

    res.send({ success: "code received" });

    try {
        console.log("1 part 1");

        const tokenData = await fetchOAuthToken(code);

        console.log("1 part 2");

        await fs.writeFile("database.json", JSON.stringify(tokenData));
    } catch (error) {
        console.log("Error while writing data to database.json", error);
        return;
    }

    try {
        console.log("2 part 1");

        const accessToken = await readAccessTokenFromDatabase();

        if (!accessToken) {
            throw new Error("Access token not found");
        }

        const userData = await fetchOsuUserData(accessToken);

        console.log(userData);

        console.log("2 part 2");
    } catch (error) {
        console.log(error);
    }
});

// function for recceived the access and refresh tokens
async function fetchOAuthToken(code) {
    const url = new URL("https://osu.ppy.sh/oauth/token");

    const body = new URLSearchParams({
        client_id: "32635",
        client_secret: "mL3m6YEczvY9wKItuZY8hbchWXHgsqVUExAdQsEL",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000/",
    });

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch OAuth token");
    }

    return response.json();
}

// function for reading the access token from the database.json
async function readAccessTokenFromDatabase() {
    try {
        const data = await fs.readFile("database.json");
        const jsonData = JSON.parse(data);
        return jsonData.access_token;
    } catch (error) {
        console.log("Error while reading the database.json", error);
        throw error;
    }
}

// function for making an API request for getting the userdata
async function fetchOsuUserData(accessToken) {
    const url = new URL("https://osu.ppy.sh/api/v2/me/osu");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user data");
    }

    return response.json();
}

// Starts the express server
app.listen(port, () => {
    console.log(`Started server on port ${port}`);
});
