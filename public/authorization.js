// Redirects user to osu authorization page
// If authorized succesfully then user is redirected back with code in the url
function authorization_redirect() {
    const url = new URL("https://osu.ppy.sh/oauth/authorize");

    const params = {
        client_id: "32635",
        redirect_uri: "http://localhost:3000/",
        response_type: "code",
    };

    Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
    );

    window.location.href = url;
}

// Extracts the code from the url and returns it
function get_code() {
    const current_url = new URL(window.location.href);
    const code = current_url.searchParams.get("code");

    if (code) {
        return code;
    } else {
        console.log("Code not found");
        return null;
    }
}

// Send code received above to backend for API requests
function send_code_to_backend() {
    const code = get_code();

    if (code) {
        fetch("http://localhost:3000/code_transfer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code }),
        })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error("Error:", error));
    } else {
        console.log("No code found");
    }
}
