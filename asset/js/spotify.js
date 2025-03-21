let currentSong = new Audio();
var songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Add leading zeros if necessary
    var formatteMinutes = minutes.toString().padStart(2, '0');
    var formatteSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formatteMinutes}:${formatteSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/asset/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    // Show all the Songs is the PlayList
    let songURL = document.querySelector(".songs_list").getElementsByTagName("ul")[0]
    songURL.innerHTML = "";
    for (const song of songs) {
        // songURL.innerHTML = songURL.innerHTML + `<li>${song}</li>`;
        songURL.innerHTML = songURL.innerHTML + ` <li>
        <div class="svg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white"
            class="bi bi-music-note-beamed me-2" viewBox="0 0 16 16">
            <path
                d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.896 2.5 2m9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2" />
            <path fill-rule="evenodd" d="M14 11V2h1v9zM6 3v10H5V3z" />
            <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4z"/>
        </svg>
        </div>
        <div class="info">
            <div class="names">${song}</div>
            <div class="names">Song Artist</div>
        </div>
        <div class="playnow d-flex justify-content-center align-items-center">
        <span>Play Now</span> 
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill=""
        class="bi bi-play-circle invert" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        <path
            d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
    </svg>
        </div>
    </li>`;
    }

    // Attach an event Listener to each song
    Array.from(document.querySelector(".songs_list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });

    return songs;

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("asset/songs/" + track);
    // audio.play();

    currentSong.src = `./asset/${currentFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "./asset/svg/pause.svg"
    }
    document.querySelector(".song_info").innerHTML = decodeURI(track)
    document.querySelector(".song_time").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/asset/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector('.card_container')
    let array = Array.from(anchors)

    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs")) {
            // let folder = e.href.split("/").splice(-2)[0]
            let folder = e.href.split('/')[5];
            if (folder !== 'asset' && folder !== undefined) {
                // get the metadata of the folder
                let a = await fetch(`http://127.0.0.1:5500/asset/songs/${folder}/info.json`)
                let response = await a.json()
                // console.log(response);

                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="cards p-2">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
                            viewBox="0 0 24 24">
                            <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141B34" stroke-width="1.5"
                                stroke-linejoin="round"/>
                        </svg>
                    </div>
                        <img src="./asset/songs/${folder}/cover.jpg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
            }
        }
    }


    // load this playlist whenever card is clicked
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(e)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })
    // Use for...of loop to handle async/await
    // for (let e of anchors) {
    //     if (e.href.includes("/songs")) {
    //         let folder = e.href.split("/").splice(-1)[0];
    //         // Get the metadata of the folder
    //         let metadataResponse = await fetch(`http://127.0.0.1:5500/asset/songs/${folder}/info.json`);
    //         let metadata = await metadataResponse.json();
    //         console.log(metadata);
    //     }
    // }

}

async function main() {

    // Get the list Of all the Songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./asset/svg/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "./asset/svg/play.svg"
        }
    })


    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // Add an  event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100


    })

    // Add an event Listener for Hamburger
    document.querySelector(".humburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0'
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = '-120%'
    })

    // Play the songs
    // var audio = new Audio(songs[1]);
    // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(duration, audio.currentSrc)
    // });

    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').splice(-1)[0]);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').splice(-1)[0]);

        if ((index + 1) > length && (index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        // console.log("setting volume to", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}
main()