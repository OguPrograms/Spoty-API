const listContainer = document.getElementById("playlists");
const songsContainer = document.getElementById("songs-container");
const selectedContainer = document.getElementById("selected-container");

let token = "";
let playlistSelected = "";

/**** LISTENERS ****/

// Back button
backButton.addEventListener('click', function() {
    window.location.href = '/';
});


/**** GETS ****/

function getToken() {
    token = window.location.href.split("access_token=")[1];
}

async function getUser() {
    const url = "https://api.spotify.com/v1/me";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data) {
            return data.id;
        } else {
            console.log("No hi ha usuari");
        }   

    } catch (error) {
        console.error("Error en obtenir l'usuari:", error);
    }
};

async function getPlaylists() {
    const url = "https://api.spotify.com/v1/me/playlists";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            // console.log("Playlists del usuario:");
            data.items.forEach(playlist => {
                // console.log(`- ${playlist.name} (ID: ${playlist.id})`);
                displayPlaylist(playlist);
            });
        } else {
            console.log("El usuario no tiene playlists.");
        }

    } catch (error) {
        console.error("Error al obtener las playlists:", error);
    }
};

async function getSavedTrack(trackIds) {
    const url = `https://api.spotify.com/v1/tracks?ids=${trackIds.join(",")}`;

    try {

        const response = await fetch(url, {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data != null) {
            displaySavedSongs(data.tracks);
        } else {
            console.log("No hi han cançons guardades");
        }

    } catch (error) {
        console.error("Error en buscar les cançons guardades:", error);
    }
};

async function getTrcksPlaylist(playListId) {
    const url = `https://api.spotify.com/v1/playlists/${playListId}/tracks`;

    try {

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data) {
            songsContainer.innerHTML = "<h1>Cançons</h1>";
            data.items.forEach(song => {
                displaySongsPlaylist(song, playListId);
            });
        } else {
            console.log("El usuario no tienecançons en aquesta playlist.");
        }

    } catch (error) {
        console.error("Error al obtener les cançons de la playlist:", error);
    }
};

/**** DELETES ****/
async function deletePlaylistSong(songURI, playListId) {
    const url = `https://api.spotify.com/v1/playlists/${playListId}/tracks`;

    try {

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                tracks: [{ uri: songURI }]
            })
        }); 

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        getTrcksPlaylist(playListId);

    } catch (error) {
        console.error("Error en borrar la cançó de la playlist:", error);
    }

}

function deleteSavedSong(savedSongId) {
    const savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];
    let newSavedSongs = [];

    savedSongs.forEach(songId => {
        if (songId !== savedSongId) {
            newSavedSongs.push(songId);
        }
    });

    localStorage.setItem("savedSongs", JSON.stringify(newSavedSongs));
    document.getElementById("selected-container").innerHTML = "<h1>Cançons seleccionades</h1>";
    getSavedTrack(newSavedSongs);
}


/**** POSTS ****/
async function postPlaylistSong(songURI, savedSongId) {
    const url = `https://api.spotify.com/v1/playlists/${playlistSelected}/tracks`;

    try {

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                uris: [songURI],
            }),
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        } else {
            getTrcksPlaylist(playlistSelected);
            deleteSavedSong(savedSongId);
            alert("La cançó s'ha afegit correctament a la playlist");
        }

    } catch (error) {
        console.error("Error en afegir la cançó a la playlist:", error);
    }

}


/**** FUNCTIONS ****/
function start() {
    listContainer.innerHTML = "";
    let savedSongsId = JSON.parse(localStorage.getItem("savedSongs")) || [];

    getToken();

    getPlaylists();

    if (savedSongsId.length != 0) {
        getSavedTrack(savedSongsId);
    }

}

function displayPlaylist(playlist) {
    const playlist_item = document.createElement("div");
    playlist_item.classList.add("playlist");

    playlist_item.innerHTML = `<h2>${playlist.name}</h2>`;
    listContainer.appendChild(playlist_item);

    playlist_item.addEventListener('click', function() {
        document.querySelectorAll('.playlistSelected').forEach(item => item.classList.remove('playlistSelected'));
        playlist_item.classList.add('playlistSelected');
        playlistSelected = playlist.id;
        document.getElementById("newPlayList").value = playlist.name;
        getTrcksPlaylist(playlist.id);
    });
};

function displaySavedSongs(savedSongs) {

    for (let i = 0; i < savedSongs.length; i++) {

        const savedSong_item = document.createElement("div");
        savedSong_item.classList.add("savedSong");

        savedSong_item.innerHTML = `<h2>${savedSongs[i].name}</h2>
                                    <h3>${savedSongs[i].artists[0].name}</h3>
                                    <div class="buttons-container">
                                        <button class="roundButton" id="addButton">+</button>
                                        <button class="roundButton" id="removeButton">-</button>
                                    </div>`;
        selectedContainer.appendChild(savedSong_item);

        let addButton = savedSong_item.querySelector("#addButton");
        let removeButton = savedSong_item.querySelector("#removeButton");

        addButton.addEventListener('click', function() {

            if (document.querySelector('.playlistSelected') != null) {
                let confirmation = confirm('Estas segur de que vols afegir la canço de la playlist selecionada?');
                if (confirmation) {
                    postPlaylistSong(savedSongs[i].uri, savedSongs[i].id);
                }
            } else {
                alert("Has de seleccionar una playlist!");
            }

        });

        removeButton.addEventListener('click', function() {
            let confirmation = confirm('Estas segur de que vols eliminar la canço de les cançons seleccionades?');

            if (confirmation) {
                deleteSavedSong(savedSongs[i].id);
            }
        });
    }

}

function displaySongsPlaylist(song, playListId) {
    const song_item = document.createElement("div");
    song_item.classList.add("songPlaylist");

    song_item.innerHTML = ` <div class="infoSong">
                                <h2>${song.track.name}</h2>
                                <h3>${song.track.artists[0].name}</h3>
                                <h4>${song.added_at}</h4>
                            </div>
                            <button class="roundButton" id="deletePlaylistSong">-</button>`;
    songsContainer.appendChild(song_item);

    let removeButton = song_item.querySelector("#deletePlaylistSong");

    removeButton.addEventListener('click', function() {

        let confirmation = confirm('Estas segur de que vols eliminar la canço de la playlist?');
        if (confirmation) {
            deletePlaylistSong(song.track.uri, playListId);
        }

    });

}

start();