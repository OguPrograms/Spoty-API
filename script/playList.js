let token = "";

/**** LISTENERS ****/

// Back button
backButton.addEventListener('click', function() {
    window.location.href = '/';
});

function getToken() {
    token = window.location.href.split("access_token=")[1];
}

/**** GETS ****/

const getUser = async function () {
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
            console.log(data.id);
        } else {
                console.log("No hi ha usuari");
        }   

    } catch (error) {
        console.error("Error en obtenir l'usuari:", error);
    }
};

const getPlaylists = async function () {
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
            });
        } else {
            console.log("El usuario no tiene playlists.");
        }

    } catch (error) {
        console.error("Error al obtener las playlists:", error);
    }
};



getToken();
console.log(getPlaylists());
