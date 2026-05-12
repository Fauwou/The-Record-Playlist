// Fetch songs for LIKED SONGS
window.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        document.getElementById('songs-container').innerHTML = '<p class="prompt-message">Please login first.</p>';
        return;
    }
    fetch("/tracks", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            const container = document.getElementById('songs-container');
            container.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                let i = 1;
                data.forEach((track) => {
                    const card = document.createElement('div');
                    card.className = 'track-card';
                    card.dataset.trackUri = track.uri;
                    card.innerHTML = `
                    <div class="track-info">
                        <p class='track_index'>${i++}</p>
                        <img src="${track.image}" class="track-image">
                        <p class="track-name">${track.name}</p>
                        <p class="track-artist">${track.artist}</p>
                        <p class="track-duration">${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</p>
                    </div>`;
                    // card.addEventListener("click", function () {
                    //     localStorage.setItem('selected_tracks', track.uri);
                    //     window.open(`https://open.spotify.com/track/${track.uri.split(":")[2]}`);
                    // });

                    card.addEventListener("click", function (wow) {
                        wow.preventDefault();
                        localStorage.setItem('selected_track_uri', track.uri);
                         localStorage.setItem('selected_track_name', track.name);
                        localStorage.setItem('selected_track_artist', track.artist);
                        localStorage.setItem('selected_track_image', track.image);
                        window.location.href = "music.html";
                    });

                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No liked songs found.</p>';
            }
        })
        .catch(() =>
            {
            document.getElementById('songs-container').innerHTML = '<p class="prompt-message">Failed to load liked tracks.</p>';
        });
});

// Fetching artists
window.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        document.getElementById('artists-container').innerHTML = '<p class="prompt-message">Please login first.</p>';
        return;
    }
    fetch('/artists', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            const container = document.getElementById('artists-container');
            container.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                let i = 1;
                data.forEach((artist) => {
                    const card = document.createElement('div');
                    card.className = 'artist-card';
                    card.dataset.artistId = artist.id;
                    card.innerHTML = `
                    <div class="artist-info">
                        <p class='artist_index'>${i++}</p>
                        <img src="${artist.image}" class="artist-image">
                        <p class="artist-name">${artist.name}</p>
                        <p class="artist-genre">${artist.genre}</p>
                    </div>`;
                    card.addEventListener("click", function () {
                        localStorage.setItem('selected_artistId', artist.id);
                        localStorage.removeItem('selected_album_id');
                        window.location.href = "http://127.0.0.1:8080/music.html";
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No artists found.</p>'
            }
        })
        .catch(() => {
            document.getElementById('artists-container').innerHTML = '<p class="prompt-message">Failed to load artists.</p>';
        });
});

// TAKE ARTIST TOP TRACKS
function getArtistTopTracks() {
    const artistId = localStorage.getItem('selected_artistId');
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        document.getElementById('albums-track-container').innerHTML ='<p class="prompt-message">Please login first.</p>';
        return [];
    }
    fetch(`/artists/toptracks?artistId=${artistId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            let artistTopTracks = data.topTracks || data;
            const container = document.getElementById('albums-track-container');
            container.innerHTML = '';
            if (Array.isArray(artistTopTracks) && artistTopTracks.length > 0) {
                let i = 1;
                artistTopTracks.forEach((track) => {
                    const card = document.createElement('div');
                    card.className = 'track-card';
                    card.dataset.uri = track.uri;
                    card.innerHTML = `
                    <div class="track-info">
                        <p class='track_index'>${i++}</p>
                        <img src="${track.image || 'https://via.placeholder.com/50'}" class="track-image">
                        <p class="track-name">${track.name}</p>
                        <p class="track-duration">${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</p>
                    </div>`;
                    card.addEventListener("click", function (wow) {
                        wow.preventDefault();
                        localStorage.setItem('selected_tracks', track.uri);
                        if (window.spotifyEmbedController) {
                            window.spotifyEmbedController.loadUri(track.uri);
                        } else {
                            console.log("Spotify embed controller not working yet");
                        }

                        const songTitle = document.querySelector('.song-title');
                        const songArtist = document.querySelector('.song-artist');
                        const albumArt = document.querySelector('.album-art');

                        if (songTitle) songTitle.textContent = track.name;
                        if (songArtist) songArtist.textContent = track.artist || 'Unknown Artist';
                        if (albumArt) albumArt.src = track.image || './Lo_images/pngtree-rubber-duck-bathing-cute-play-png-image_6325644.jpg';
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No top tracks found.</p>';
            }
        })
        .catch((error) => {
            console.error('Error fetching top tracks:', error);
            document.getElementById('albums-track-container').innerHTML = '<p class="prompt-message">Failed to load top tracks.</p>';
        });
    return[];
}

// Fetching albums
window.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        document.getElementById('albums-container').innerHTML = '<p class="prompt-message">Please login first.</p>';
        return;
    }
    fetch('/albums', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            const container = document.getElementById('albums-container');
            container.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                let i = 1;
                data.forEach((albums) => {
                    const card = document.createElement('div');
                    card.className = 'albums-card';
                    card.dataset.albumId = albums.id;
                    card.dataset.albumImage = albums.image;
                    card.innerHTML = `
                    <div class="albums-info">
                        <p class='album_index'>${i++}</p>
                        <img src="${albums.image}" class="albums-image">
                        <p class="album-name">${albums.name}</p>
                    </div>`;
                    card.addEventListener("click", function () {
                        localStorage.setItem('selected_album_id', albums.id);
                        localStorage.setItem('selected_album_image', albums.image);
                        window.location.href = "http://127.0.0.1:8080/music.html";
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No albums found.</p>';
            }
        })
        .catch(() => {
            document.getElementById('albums-container').innerHTML = '<p class="prompt-message">Failed to load albums.</p>';
        });
});

// TAKE ALBUM TRACKS
function getAlbumTracks() {
    const albumId = localStorage.getItem('selected_album_id');
    const albumImage = localStorage.getItem('selected_album_image');
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        document.getElementById('albums-track-container').innerHTML =
            '<p class="prompt-message">Please login first.</p>';
        return [];
    }
    fetch(`/albums/tracks?albumId=${albumId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            let albumTracks = data.albumTracks || data;
            const container = document.getElementById('albums-track-container');
            container.innerHTML = '';
            if (Array.isArray(albumTracks) && albumTracks.length > 0) {
                let i = 1;
                albumTracks.forEach((track) => {
                    const card = document.createElement('div');
                    card.className = 'track-card';
                    card.dataset.uri = track.uri;
                    card.innerHTML = `
                    <div class="track-info">
                        <p class='track_index'>${i++}</p>
                        <img src="${albumImage}" class="track-image">
                        <p class="track-name">${track.name}</p>
                        <p class="track-duration">${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</p>
                    </div>`;
                    // card.addEventListener("click", function () {
                    //     localStorage.setItem('selected_tracks', track.uri);
                    //     window.open(`https://open.spotify.com/track/${track.uri.split(":")[2]}`);
                    // });

                    card.addEventListener("click", function (wow) {
                        wow.preventDefault();
                        localStorage.setItem('selected_tracks', track.uri);
                        if (window.spotifyEmbedController) {
                            window.spotifyEmbedController.loadUri(track.uri);
                        } else {
                            console.log("Spotify embed controller not working yet");
                        }


                        const songTitle = document.querySelector('.song-title');
                        const songArtist = document.querySelector('.song-artist');
                        const albumArt = document.querySelector('.album-art');

                        if (songTitle) songTitle.textContent = track.name;
                        if (songArtist) songArtist.textContent = track.artist || 'Unknown Artist';
                        if (albumArt) albumArt.src = track.image || './Lo_images/pngtree-rubber-duck-bathing-cute-play-png-image_6325644.jpg';
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No album tracks found.</p>';
            }
        })
        .catch(() => {
            document.getElementById('albums-track-container').innerHTML = '<p class="prompt-message">Failed to load album tracks.</p>';
        });
    return[];
}


// Fetching playlists
window.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        document.getElementById('playlist-container').innerHTML = '<p class="prompt-message">Please login first.</p>';
        return;
    }
    fetch('/playlists', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            const container = document.getElementById('playlist-container');
            container.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                let i = 1;
                data.forEach((playlists) => {
                    const card = document.createElement('div');
                    card.className = 'playlist-card';
                    card.dataset.playlistId = playlists.id;
                    card.innerHTML = `
                    <div class="playlist-info">
                        <p class='playlist_index'>${i++}</p>
                        <img src="${playlists.image}" class="playlist-image">
                        <p class="playlist-name">${playlists.name}</p>
                    </div>`;
                    card.addEventListener("click", function () {
                        localStorage.setItem('selected_playistId', playlists.id);
                        window.location.href = "http://127.0.0.1:8080/music.html";
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No playlists found.</p>';
            }
        })
        .catch(() => {
            document.getElementById('playlist-container').innerHTML = '<p class="prompt-message">Failed to load playlists.</p>';
        });
});


//TAKE PLAYLIST TRACKS
function getPlaylistTracks() {
    const playlistId = localStorage.getItem('selected_playistId');
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        document.getElementById('albums-track-container').innerHTML ='<p class="prompt-message">Please login first.</p>';
        return [];
    }
    fetch(`/playlists/tracks?playlistId=${playlistId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            let numPlaylistTracks = data.playlistsTracks || data;
            const container = document.getElementById('albums-track-container');
            container.innerHTML = '';
            if (Array.isArray(numPlaylistTracks) && numPlaylistTracks.length > 0) {
                let i = 1;
                numPlaylistTracks.forEach((track) => {
                    const card = document.createElement('div');
                    card.className = 'track-card';
                    card.dataset.uri = track.uri;
                    card.innerHTML = `
                    <div class="track-info">
                        <p class='track_index'>${i++}</p>
                        <img src="${track.image || 'https://via.placeholder.com/50'}" class="track-image">
                        <p class="track-name">${track.name}</p>
                        <p class="track-duration">${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</p>
                    </div>`;
                    card.addEventListener("click", function () {
                        localStorage.setItem('selected_tracks', track.uri);
                        window.open(`https://open.spotify.com/track/${track.uri.split(":")[2]}`);
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No top tracks found.</p>';
            }
        })
        .catch((error) => {
            console.error('Error fetching top tracks:', error);
            document.getElementById('albums-track-container').innerHTML = '<p class="prompt-message">Failed to load artist tracks.</p>';
        });
    return;
}


window.addEventListener('DOMContentLoaded', () => {
    const albumId = localStorage.getItem('selected_album_id')
    const artistId = localStorage.getItem('selected_artistId')
    const playlistId = localStorage.getItem('selected_playistId')
    const trackUri = localStorage.getItem('selected_track_uri')

    if (artistId && window.location.pathname.includes('music.html')) {
        localStorage.removeItem('selected_album_id')
        localStorage.removeItem('selected_playistId')
        getArtistTopTracks();
    } else if (albumId && window.location.pathname.includes('music.html')) {
        localStorage.removeItem('selected_artistId')
        localStorage.removeItem('selected_playistId')
        getAlbumTracks();
    } else if (playlistId && window.location.pathname.includes('music.html')) {
        localStorage.removeItem('selected_artistId')
        localStorage.removeItem('selected_album_id')
        getPlaylistTracks();
    } else if (trackUri && window.location.pathname.includes('music.html')) {
        localStorage.removeItem('selected_artistId')
        localStorage.removeItem('selected_album_id')
        localStorage.removeItem('selected_playistId')
        playSingleTrack();
    } else {
        localStorage.removeItem('selected_artistId')
        localStorage.removeItem('selected_album_id')
        localStorage.removeItem('selected_playistId')
        localStorage.removeItem('selected_track_uri')
    }
})








/* FUNCTIONS TO DISPLAY THE DATA GATHERED */


function display_albums() {
    const x = document.getElementById('albums-container');
    const m = document.getElementById('album-container');
    if (x.style.display === 'none') {
        m.style.display = 'block';
        x.style.display = 'block';
    } else {
        m.style.display = 'none';
        x.style.display = 'none';
    }
}

function display_songs() {
    const x = document.getElementById('songs-container');
    const m = document.getElementById('liked-container');
    if (x.style.display === 'none') {
        m.style.display = 'block';
        x.style.display = 'block';
    } else {
        m.style.display = 'none';
        x.style.display = 'none';
    }
}

function display_artists() {
    const x = document.getElementById('artists-container');
    const m = document.getElementById('artist-container');
    if (x.style.display === 'none') {
        m.style.display = 'block';
        x.style.display = 'block';
    } else {
        m.style.display = 'none';
        x.style.display = 'none';
    }
}

function display_playlists() {
    const x = document.getElementById('playlist-container');
    const m = document.getElementById('playlists-container');
    if (x.style.display === 'none') {
        m.style.display = 'block';
        x.style.display = 'block';
    } else {
        m.style.display = 'none';
        x.style.display = 'none';
    }
}




function getAlbumandStore() {
    const albumId = localStorage.getItem('selected_album_id');
    const albumImage = localStorage.getItem('selected_album_image');
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        document.getElementById('albums-track-container').innerHTML =
            '<p class="prompt-message">Please login first.</p>';
        return [];
    }
    fetch(`/albums/tracks?albumId=${albumId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            let albumTracks = data.albumTracks || data;
            const container = document.getElementById('albums-track-container');
            container.innerHTML = '';
            if (Array.isArray(albumTracks) && albumTracks.length > 0) {
                let i = 1;
                albumTracks.forEach((track) => {
                    const card = document.createElement('div');
                    card.className = 'track-card';
                    card.dataset.uri = track.uri;
                    card.innerHTML = `
                    <div class="track-info">
                        <p class='track_index'>${i++}</p>
                        <img src="${albumImage}" class="track-image">
                        <p class="track-name">${track.name}</p>
                        <p class="track-duration">${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</p>
                    </div>`;
                    card.addEventListener("click", function () {
                        localStorage.setItem('selected_tracks', track.uri);
                        window.open(`https://open.spotify.com/track/${track.uri.split(":")[2]}`);
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="prompt-message">No album tracks found.</p>';
            }
        })
        .catch(() => {
            document.getElementById('albums-track-container').innerHTML = '<p class="prompt-message">Failed to load album tracks.</p>';
        });
    return[];
}







/* MUSIC PLAYER */

function playSingleTrack() {
    const trackUri = localStorage.getItem('selected_track_uri');
    const container = document.getElementById('albums-track-container');

    if (!trackUri) {
        container.innerHTML = '<p class="prompt-message">No track selected.</p>';
        return;
    }

    const trackName = localStorage.getItem('selected_track_name') || 'Unknown Track';
    const trackArtist = localStorage.getItem('selected_track_artist') || 'Unknown Artist';
    container.innerHTML = `
        <div class="track-header">
            <a style="padding-left: 20px; padding-right: 10px;"> No. </a>
            <a style="padding-right: 370px;">| Name </a>
            <a style="padding-left: 680px; padding-right: 10px;">| Length</a>
        </div>
        <div class="track-card">
            <div class="track-info">
                <p class='track_index'>1</p>
                <img src="${trackImage}" class="track-image">
                <p class="track-name">${trackName}</p>
                <p class="track-artist">${trackArtist}</p>
                <p class="track-duration">--:--</p>
            </div>
        </div>
    `;

    if (window.spotifyEmbedController) {
        window.spotifyEmbedController.loadUri(trackUri);
    }

    const songTitle = document.querySelector('.song-title');
    const songArtist = document.querySelector('.song-artist');
    const albumArt = document.querySelector('.album-art');

    if (songTitle) songTitle.textContent = trackName;
    if (songArtist) songArtist.textContent = trackArtist;
    if (albumArt) albumArt.src = trackImage;
}





function getArtistTopTracks() {
    const artistId = localStorage.getItem('selected_artistId');
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        document.getElementById('albums-track-container').innerHTML ='<p class="prompt-message">Please login first.</p>';
        return [];
    }
    fetch(`/artists/toptracks?artistId=${artistId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            let artistTopTracks = data.topTracks || data;
            const container = document.getElementById('albums-track-container');
            container.innerHTML = '';
            if (Array.isArray(artistTopTracks) && artistTopTracks.length > 0) {
                let i = 1;
                artistTopTracks.forEach((track) => {
                    const card = document.createElement('div');
                    card.className = 'track-card';
                    card.dataset.uri = track.uri;
                    card.innerHTML = `
                    <div class="track-info">
                        <p class='track_index'>${i++}</p>
                        <img src="${track.image || 'https://via.placeholder.com/50'}" class="track-image">
                        <p class="track-name">${track.name}</p>
                        <p class="track-duration">${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</p>
                    </div>`;
                    container.appendChild(card);
                });

                setupTrackClickHandlers();
            } else {
                container.innerHTML = '<p class="prompt-message">No top tracks found.</p>';
            }
        })
        .catch((error) => {
            console.error('Error fetching top tracks:', error);
            document.getElementById('albums-track-container').innerHTML = '<p class="prompt-message">Failed to load top tracks.</p>';
        });
    return[];
}

function setupTrackClickHandlers() {
    document.querySelectorAll('.track-card').forEach(track => {
        track.addEventListener('click', function(e) {
            e.preventDefault();
            const uri = this.dataset.uri;
            if (uri && window.spotifyEmbedController) {
                window.spotifyEmbedController.loadUri(uri);
            }
        });
    });
}