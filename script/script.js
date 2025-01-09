import { clientId, clientSecret } from "../env/client.js";

let tokenAccess = null;

/**** LISTENERS ****/

// Searche button
searchButton.addEventListener('click', function() {
    if (searchInput.value === "") {
        alert("Has d'introduir una cançó per poder buscar");
    } else if (searchInput.value.length <= 2) {
        alert("Has d'introduir més de 2 lletres per poder buscar");
    } else if (tokenAccess) {
        search();
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
            search();
        }

    }
});

// Delete button
deleteButton.addEventListener('click', function() {
    if (tokenAccess && searchInput) {
        clear();
    }
});

/**** API CONECTION ****/
const getSpotifyAccessToken = function (clientId, clientSecret) {
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
        // Haurem d’habilitar els botons “Buscar” i “Borrar”
    })
    .catch((error) => {
        // SI durant el fetch hi ha hagut algun error arribarem aquí.
        console.error("Error a l'obtenir el token:", error);
    });
};


/**** SEARCH ****/
function search() {
    const input = document.getElementById("searchInput").value;
    document.getElementById("deleteButton").disabled = false;

    searchSpotifyTracks(input, tokenAccess);
}

const searchSpotifyTracks = function (query, accessToken) {
    // Definim l’endpoint, la query és el valor de búsqueda.
    // Limitem la búsqueda a cançons i retornarà 12 resultats.
    const searchUrl =
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            query
        )}&type=track&limit=12`;

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

        renderTracks(data.tracks.items);

    })
    .catch((error) => {
        console.error("Error al buscar cançons:", error);
    });
};

/**** RENDER TRACKS ****/
function renderTracks (tracks) {
    const tracksContainer = document.getElementById("tracks-container");

    for (let i = 0; i < tracks.length; i++) {
        const track = document.createElement("div");
        track.classList.add("track");
        track.innerHTML = `<img class="track__image" src="${tracks[i].album.images[0].url}" alt="Album cover"/>
                            <h1>${tracks[i].name}</h1>
                            <h3>Album:</h3>
                            <h2>${tracks[i].album.name}</h2>
                            <h3>Artista:</h3>
                            <h2>${tracks[i].artists[0].name}</h2>`;
        tracksContainer.appendChild(track);
    }
}

/**** CLEAR INPUT ****/
function clear() {
    searchInput.value = ''; 
}


getSpotifyAccessToken(clientId, clientSecret);