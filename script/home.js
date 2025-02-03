import { clientId, clientSecret } from "../env/client.js";

let tokenAccess = null;
let searchMessage = "<div class='search-message'>CERCA UNA CANÇÓ</div>";
let numTracks = 12;

/**** LISTENERS ****/

// Searche button
searchButton.addEventListener('click', function() {

    if (searchInput.value === "") {
        alert("Has d'introduir una cançó per poder buscar");
    } else if (searchInput.value.length <= 2) {
        alert("Has d'introduir més de 2 lletres per poder buscar");
    } else if (tokenAccess) {
        // In case user sarche for second time, I clearn the tracks
        document.getElementById("tracks-container").innerHTML = "";
        numTracks = 12
        search(0);
    }

});

// On press enter
searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {

        if (searchInput.value === "") {
            alert("Has d'introduir una cançó per poder buscar");
        } else if (searchInput.value.length <= 2) {
            alert("Has d'introduir més de 2 lletres per poder buscar");
        } else if (tokenAccess) {

            document.getElementById("tracks-container").innerHTML = "";
            numTracks = 12
            search(0);

        }

    }
});

// Delete button
deleteButton.addEventListener('click', function() {
    if (tokenAccess && searchInput) {
        clear();
    }
});

// PlayList button
playlistButton.addEventListener('click', function() {
    autoritzar();
});

/**** API CONECTION ****/
function getSpotifyAccessToken(clientId, clientSecret) {
    // Url de l'endpont de spotify
    const url = "https://accounts.spotify.com/api/token";
    // ClientId i ClienSecret generat en la plataforma de spotify
    const credentials = btoa(`${clientId}:${clientSecret}`);

    //Es crear un header on se li passa les credencials
    const header = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
    };

    fetch(url, {
        method: "POST",
        headers: header,
        body: "grant_type=client_credentials", // Paràmetres del cos de la sol·licitud
    })
    .then((response) => {
        // Controlar si la petició ha anat bé o hi ha alguna error.
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json(); // Retorna la resposta com JSON
    })
    .then((data) => {
        // Al data retorna el token d'accés que necessitarem
        tokenAccess = data.access_token;
        document.getElementById("searchButton").disabled = false;
        document.getElementById("playlistButton").disabled = false;
        // Haurem d’habilitar els botons “Buscar” i “Borrar”
    })
    .catch((error) => {
        // SI durant el fetch hi ha hagut algun error arribarem aquí.
        console.error("Error a l'obtenir el token:", error);
    });
};


/**** SEARCH ****/
function search(offset) {
    const query = document.getElementById("searchInput").value;
    document.getElementById("deleteButton").disabled = false;

    let searchUrl =
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
    )}&type=track&limit=12`;

    searchSpotifyTracks(searchUrl, tokenAccess);
}

function searchSpotifyTracks(searchUrl, accessToken) {
    // Definim l’endpoint, la query és el valor de búsqueda.
    // Limitem la búsqueda a cançons i retornarà 12 resultats.
    
    // Al headers sempre s’ha de posar la mateixa informació.
    fetch(searchUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    })
    .then((response) => {
        // Controlem si la petició i la resposta han anat bé. 
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then((data) => {
        // Data retorna tota la informació de la consulta de l’API 

        renderTracks(data);

    })
    .catch((error) => {
        console.error("Error al buscar cançons:", error);
    });
};

// RENDER TRACKS
function renderTracks (data) {
    let tracks = data.tracks.items;
    let info = data.tracks;
    const tracksContainer = document.getElementById("tracks-container");

    for (let i = 0; i < tracks.length; i++) {

        let addButtonText = "+ Afegir"
        let savedSongs = JSON.parse(localStorage.getItem("savedSongs")) || [];

        if (savedSongs.includes(tracks[i].id)) {
            addButtonText = "A la llista"
        }

        const track = document.createElement("div");
        track.classList.add("track");
        track.innerHTML = `<img class="track__image" src="${tracks[i].album.images[0].url}" alt="Album cover"/>
                            <h1>${tracks[i].name}</h1>
                            <h3>Album:</h3>
                            <h2>${tracks[i].album.name}</h2>
                            <h3>Artista:</h3>
                            <h2>${tracks[i].artists[0].name}</h2>
                            <div class="addButton" id="addButton">
                                ${addButtonText}
                            </div>`;
        tracksContainer.appendChild(track);

        track.addEventListener('click', function() {
            tracksButton(tracks[i].artists[0].id);
        })

        const addButton = track.querySelector(`#addButton`);
        addButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Fa que no es cliquei sobre el pare, que també és clicable

            const buttonText = track.querySelector('.addButton');

            if (savedSongs.includes(tracks[i].id)) {

                savedSongs = savedSongs.filter(songId => songId !== tracks[i].id);

                localStorage.setItem("savedSongs", JSON.stringify(savedSongs));

                buttonText.innerHTML = "+ Afegir";

            } else {

                savedSongs.push(tracks[i].id);

                localStorage.setItem("savedSongs", JSON.stringify(savedSongs));

                buttonText.innerHTML = "A la llista";

                // Pintar missatge d'afegit
                document.getElementById("addedMessage").style.opacity = "1";
                setTimeout(function() {
                    document.getElementById("addedMessage").style.opacity = "0";
                }, 2500);

            }

            console.log(savedSongs);

        });
    }

    const loadSongs = document.createElement("button");
    loadSongs.classList.add("loadMoreSong");
    loadSongs.innerHTML = ` <h4>Carrega més cançons</h3>
                            <p>${(info.offset+info.limit)} de ${info.total}</p>`;
    tracksContainer.appendChild(loadSongs);

    loadSongs.addEventListener('click', function() {
        searchSpotifyTracks(info.next, tokenAccess);
        loadSongs.remove();
    })

}

/**** SEARCH ARTIST ****/
function tracksButton(artist) {
    const artistUrl = `https://api.spotify.com/v1/artists/${artist}`;
    artist = null;

    const header = {
        Authorization: `Bearer ${tokenAccess}`,
    };

    fetch(artistUrl, {
        method: "GET",
        headers: header,
    })

    .then((response) => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })

    .then((data) => {
        searchArtistBestSongs(data);
    })

    .catch((error) => {
        console.error("Error al mostrar l'artista:", error);
    });

}

// SEARCH ARTIST BEST SONGS
function searchArtistBestSongs(artist) {
    const artistId = artist.id;
    const artistUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`;

    const header = {
        Authorization: `Bearer ${tokenAccess}`,
    };

    fetch(artistUrl, {
        method: "GET",
        headers: header,
    })

    .then((response) => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })

    .then((data) => {
        renderArtist(artist, data);
    })

    .catch((error) => {
        console.error("Error al mostrar l'artista:", error);
    });

}


// RENDER ARTIST
function renderArtist (artist, bestSongs) {

    const artistContainer = document.getElementById("artist-container");
    artistContainer.innerHTML = "";

    const artistData = document.createElement("div");
    artistData.classList.add("artist");
    artistData.innerHTML = `<img class="artist__image" src="${artist.images[0].url}" alt="Artis porfile"/>
                            <h1>${artist.name}</h1>
                            <h3>Popularidad:</h3>
                            <h2>${artist.popularity}%</h2>
                            <h3>Generes:</h3>
                            <h2>${artist.genres.join(', ')}</h2>
                            <h3>Seguidors:</h3>
                            <h2>${artist.followers.total}</h2>
                            <div class="artistBestSongs">
                                <h3>Les més escoltades:</h3>
                                <div class="songWrapper">
                                    <h3>1.</h3>
                                    <h2> ${bestSongs.tracks[0].name}</h2>
                                </div>
                                <div class="songWrapper">
                                    <h3>2.</h3>
                                    <h2> ${bestSongs.tracks[1].name}</h2>
                                </div>
                                <div class="songWrapper">
                                    <h3>3.</h3>
                                    <h2> ${bestSongs.tracks[2].name}</h2>
                                </div>
                            </div>`;
    artistContainer.appendChild(artistData);

}

/**** CLEAR INPUT ****/
function clear() {
    const tracksContainer = document.getElementById("tracks-container");
    tracksContainer.innerHTML = searchMessage;

    searchInput.value = '';

}

getSpotifyAccessToken(clientId, clientSecret);


/******************************************************/
/********************** PLAYLIST **********************/
/******************************************************/

const URL = "https://accounts.spotify.com/authorize";
const redirectUri = "http://127.0.0.1:5500/playList.html";
const scopes = "playlist-modify-private user-library-modify playlist-modify-public";

function autoritzar() {

    const authUrl = URL +
                    `?client_id=${clientId}` +
                    `&response_type=token` +
                    `&redirect_uri=${redirectUri}` +
                    `&scope=${scopes}`;
    window.location.assign(authUrl);

};
