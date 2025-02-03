const listContainer = document.getElementById("playlist");
const selectedContainer = document.getElementById("selected-container");

let token = "";

/**** LISTENERS ****/

// Back button
backButton.addEventListener('click', function() {
    window.location.href = '/';
});

// Playlist
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
            console.log("Playlists del usuario:");
            data.items.forEach(playlist => {
                console.log(`- ${playlist.name} (ID: ${playlist.id})`);
                displayPlaylist(playlist.name);
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
    const url = `https://api.spotify.com/v1/playlists/${selectedPlayList}/tracks`;

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

        if (data.items && data.items.length > 0) {
            console.log("Playlists del usuario:");
            data.items.forEach(playlist => {
                console.log(`- ${playlist.name} (ID: ${playlist.id})`);
                displayPlaylist(playlist.name);
            });
        } else {
            console.log("El usuario no tiene playlists.");
        }

    } catch (error) {
        console.error("Error al obtener las playlists:", error);
    }
};


/**** FUNCTIONS ****/
function start() {
    listContainer.innerHTML = "";
    let savedSongsId = JSON.parse(localStorage.getItem("savedSongs")) || [];

    getToken();

    getPlaylists();
    getSavedTrack(savedSongsId);

}

function displayPlaylist(playlist) {
    const playlist_item = document.createElement("h2");


    playlist_item.innerHTML = `${playlist}`;
    listContainer.appendChild(playlist_item);

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
    }

}

start();