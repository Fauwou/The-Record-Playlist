export const client_ID = '47615a91d85b4d89b91a95c25bfa1da0';
const params = new URLSearchParams(window.location.search);
export const code = params.get("code");

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('profile-container');
    if (container) {
        container.innerHTML = '';
    }
});

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const authParams = new URLSearchParams();
    authParams.append("client_id", clientId);
    authParams.append("response_type", "code");
    authParams.append("redirect_uri", "http://127.0.0.1:8080/profile.html");
    authParams.append("scope", "user-read-private user-read-email user-library-read user-follow-read");
    authParams.append("code_challenge_method", "S256");
    authParams.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${authParams.toString()}`;
}

export async function getAccessToken(clientId, CODE) {
    const verifier = localStorage.getItem("verifier");

    const tokenParams = new URLSearchParams();
    tokenParams.append("client_id", clientId);
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("code", CODE);
    tokenParams.append("redirect_uri", "http://127.0.0.1:8080/profile.html");
    tokenParams.append("code_verifier", verifier);

    try {
        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: tokenParams
        });

        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }

        const { access_token } = await result.json();
        localStorage.setItem("access_token", access_token);
        return access_token;
    } catch (error) {
        console.error("Error getting access token:", error);
        throw error;
    }
}

export async function fetchProfile(token) {
    try {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }

        return await result.json();
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}

export function populateUI(profile) {
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images && profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        const avatar = document.getElementById("avatar");
        if (avatar) {
            avatar.innerHTML = '';
            avatar.appendChild(profileImage);
        }
        const imgUrl = document.getElementById("imgUrl");
        if (imgUrl) {
            imgUrl.innerText = profile.images[0].url;
        }
    }

    const setIfExists = (id, value) => {
        const element = document.getElementById(id);
        if (element && value) element.innerText = value;
    };

    setIfExists("id", profile.id);
    setIfExists("email", profile.email);

    const uriElement = document.getElementById("uri");
    if (uriElement) {
        uriElement.innerText = profile.uri;
        if (profile.external_urls) {
            uriElement.setAttribute("href", profile.external_urls.spotify);
        }
    }

    const urlElement = document.getElementById("url");
    if (urlElement) {
        urlElement.innerText = profile.href;
        urlElement.setAttribute("href", profile.href);
    }
}

export async function getUserAndStore() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        document.getElementById('albums-track-container').innerHTML =
            '<p class="prompt-message">Please login first.</p>';
        return;
    }
    try {
        const profileResponse = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile from Spotify');
        }


        const profile = await profileResponse.json();
        const userPayload = {
            spotify_id: profile.id,
            display_name: profile.display_name,
            email: profile.email,
            profile_image: profile.images?.[0]?.url || null
        };

        const storeResponse = await fetch('/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(userPayload)
        });


        if (!storeResponse.ok) {
            throw new Error('Failed to store user in database');
        }

        document.getElementById('albums-track-container').innerHTML =
            '<p class="prompt-message">User data stored successfully.</p>';
    } catch (error) {
        document.getElementById('albums-track-container').innerHTML =
            '<p class="prompt-message">Error storing user data.</p>';
        console.error(error);
    }
}

export function spotifyingAuthCat() {
    if (!code) {
        redirectToAuthCodeFlow(client_ID);
    } else {
        getAccessToken(client_ID, code)
            .then((accessToken) => fetchProfile(accessToken))
            .then((profile) => {
                populateUI(profile);
                getUserAndStore();
            });
    }
}
