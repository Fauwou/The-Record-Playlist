var express = require('express');
const { json } = require('express/lib/response');
var router = express.Router();
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
// const { listen } = require('../app');
const mysql = require('mysql')




/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


const port = process.env.PORT || 8080;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URL
});

const db = mysql.createPool({
    host: 'localhost',
    database: 'appDatabase'
});

router.get('/login', (req, res) => {
    const scopes = [
        'user-read-private',
        'user-read-email',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-library-read',
        'user-top-read'
    ];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});


router.get('/callback', async (req, res) => {
    const { error, code } = req.query;

    if (error) {
        console.error('Callback Error:', error);
        return res.send(`Callback Error: ${error}`);
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);

        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        const me = await spotifyApi.getMe();
        const spotifyId = me.body.id;
        const displayName = me.body.display_name;
        const email = me.body.email;
        const profileImage = me.body.images?.[0]?.url || null;

        await db.query(
            `INSERT INTO User (Spotify_ID, Display_name, Email, Profile_image)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE Display_name=VALUES(Display_name), Email=VALUES(Email), Profile_image=VALUES(Profile_image)`,
            [spotifyId, displayName, email, profileImage]
        );

        console.log('User inserted/updated in database:', spotifyId);
        console.log('Access token:', accessToken);
        console.log('Refresh token:', refreshToken);

        res.sendFile(path.join(__dirname, 'public', 'profile.html'));

        setInterval(async () => {
            try {
                const refreshedData = await spotifyApi.refreshAccessToken();
                spotifyApi.setAccessToken(refreshedData.body['access_token']);
                console.log('Access token refreshed');
            } catch (refreshErr) {
                console.error('Error refreshing access token:', refreshErr);
            }
        }, (expiresIn / 2) * 1000);

    } catch (tokenErr) {
        console.error('Error during token exchange or user fetch:', tokenErr);
        res.status(500).send('Authentication failed');
    }
});

router.get('/search', (req, res) => {
    const { q } = req.query;

    spotifyApi.searchTracks(q).then((searchData) => {
        const trackUri = searchData.body.tracks.items[0].uri;
        res.send({ uri: trackUri });
    }).catch((err) => {
        console.error('Search Error:', err);
        res.send('Error occurred during search');
    });
});


router.get('/tracks', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

        const data = await spotifyApi.getMySavedTracks({ limit: 50, offset: 0 });
        const tracks = data.body.items.map(item => ({
            name: item.track.name,
            artist: item.track.artists.map(a => a.name).join(', '),
            duration: item.track.duration_ms,
            image: item.track.album.images[0]?.url || '',
            uri: item.track.uri,
            url: item.track.external_urls
        }));

        res.json(tracks);
    } catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ error: error.message });
    }
});


//get artists
router.get('/artists', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

        const data = await spotifyApi.getFollowedArtists();
        const artists = data.body.artists.items.map(artist => ({
            name: artist.name,
            id: artist.id,
            genre: artist.genres.join(', '),
            image: artist.images[0]?.url || '',
            uri: artist.uri
        }));

        res.json(artists);
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).json({ error: error.message });
    }
});

//get artist top tracks
router.get('/artists/toptracks', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { artistId } = req.query;
        if (!artistId) {
            return res.status(400).json({ error: 'No artistId provided' });
        }

        // console.log('Fetching top tracks for artistId:', artistId);

        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

        const response = await spotifyApi.getArtistTopTracks(artistId, 'AU');
        console.log('API Response:', response.body);
        if (!response || !response.body || !response.body.tracks) {
            throw new Error('Invalid response from Spotify API');
        }

        const tracks = response.body.tracks.map(track => ({
            name: track.name,
            duration: track.duration_ms,
            uri: track.uri,
            preview_url: track.preview_url,
            image: track.album.images[0]?.url || 'https://via.placeholder.com/50',
            popularity: track.popularity || 0,
        }));

        // console.log('Processed tracks:', tracks);
        res.json({ topTracks: tracks });
    } catch (error) {
        console.error('Error fetching artist top tracks:', error.message);
        res.status(500).json({ error: 'Failed to fetch top tracks: ' + error.message });
    }
});




//get albums
router.get('/albums', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

        const data = await spotifyApi.getMySavedAlbums({ limit: 50, offset: 0 });
        const albums = data.body.items.map(item => ({
            name: item.album.name,
            image: item.album.images[0]?.url || '',
            tracks: item.album.tracks,
            uri: item.album.uri,
            id: item.album.id
        }))

        res.json(albums);
    } catch (error) {
        console.error('Error fetching albums:', error);
        res.status(500).json({ error: error.message });
    }
})



//get albums tracks
router.get('/albums/tracks', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { albumId } = req.query;
        if (!albumId) {
            return res.status(400).json({ error: 'No albumId provided' });
        }

        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

        console.log('Fetching album tracks for albumId:', albumId);
        const data = await spotifyApi.getAlbumTracks(albumId, { limit: 50, offset: 0 });
        // console.log('API Response:', data.body);


        const tracks = data.body.items.map(item => ({
            name: item.name,
            duration: item.duration_ms,
            uri: item.uri,
        }));

        // console.log('Processed tracks:', tracks);
        res.json({ albumTracks: tracks });
    } catch (error) {
        console.error('Error fetching album tracks:', error);
        res.status(500).json({ error: error.message });
    }
});


//get playists
router.get('/playlists', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const spotifyApiInstance = new SpotifyWebApi();
        spotifyApiInstance.setAccessToken(accessToken);

        const data = await spotifyApiInstance.getUserPlaylists();
        const playlists = data.body.items.map(item => ({
            name: item.name,
            image: item.images[0]?.url || '',
            id: item.id,
            tracks: item.tracks.total
        }));
        res.json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: error.message });
    }
});

// get playist tracks
router.get('/playlists/tracks', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { playlistId } = req.query;
        if (!playlistId) {
            return res.status(400).json({ error: 'No playlistId provided' });
        }

        // console.log('Fetching tracks for playlistId:', playlistId);

        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

        const response = await spotifyApi.getPlaylistTracks(playlistId, { limit: 50, offset: 0 });

        if (!response || !response.body || !Array.isArray(response.body.items)) {
            throw new Error('Invalid response from Spotify API');
        }

        const tracks = response.body.items
            .filter(item => item.track)
            .map(item => ({
                name: item.track.name,
                duration: item.track.duration_ms,
                uri: item.track.uri,
                preview_url: item.track.preview_url,
                image: item.track.album?.images?.[0]?.url || 'https://via.placeholder.com/50'
            }));

        // console.log('Processed tracks:', tracks);
        res.json({ playlistsTracks: tracks });
    } catch (error) {
        console.error('Error fetching playlist tracks:', error.message);
        res.status(500).json({ error: 'Failed to fetch playlist tracks: ' + error.message });
    }
});

router.get('/play', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        const { uri } = req.query;
        console.log(req.query.play)

        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const spotifyApiInstance = new SpotifyWebApi();
        spotifyApiInstance.setAccessToken(accessToken);

        await spotifyApiInstance.play({ uris: [uri] });
        res.send('Playback started');
    } catch (err) {
        console.error('Play Error:', err);
        res.send('Error occurred during playback');
    }
});

router.get('/profile', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

        const response = await spotifyApi.getMe();

        if (!response || !response.body) {
            throw new Error('Invalid response from Spotify API');
        }

        const profile = {
            id: response.body.id,
            display_name: response.body.display_name,
            email: response.body.email,
            images: response.body.images,
            country: response.body.country,
            product: response.body.product
        };

        res.json({ storeUser: profile });
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch user profile: ' + error.message });
    }
});

//database
router.post('/profile', function (req, res) {
    const { spotify_id, display_name, email, profile_image } = req.body;
    if (!spotify_id || !display_name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = `
        INSERT INTO User (Spotify_ID, Display_name, Email, Profile_image)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            Display_name = VALUES(Display_name),
            Email = VALUES(Email),
            Profile_image = VALUES(Profile_image);
    `;
    db.query(query, [spotify_id, display_name, email, profile_image], (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(201).json({ id: spotify_id });
        }
    });
});

router.post('/albums', function (req, res) {
    const { Album_ID, Album_name, Album_cover } = req.body;
    if (!Album_ID || !Album_name || !Album_cover) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = `
        INSERT INTO User ( Album_ID, Album_name, Album_cover)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            Album_ID = VALUES(Album_ID),
            Album_name = VALUES(Album_name),
            Album_cover = VALUES(Album_cover);
    `;
    db.query(query, [Album_ID, Album_name, Album_cover], (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(201).json({ id: Album_ID });
        }
    });
});


module.exports = router;
