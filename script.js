// Disable right-click context menu
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
}); // to open the console (ctrl + shift + i)

// There is second way for pointerleave
document.addEventListener('pointerleave', (e) => {
    console.log("Pointer leave element")
})

// There is third way for on pointerleave
const para = document.querySelector('.footer')
para.onpointerleave = (event0) => {
    console.log("Pointer leave element")
}


let currentSong = new Audio();
let play = document.getElementById("play");
let songs;
let previous = document.getElementById("previous");
let next = document.getElementById("next")
let songUL;
let currFolder;

function formatTime(seconds) {
    // Ensure the input is a number
    seconds = parseInt(seconds, 10);

    // Ensure seconds is positive
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    // Add leading zero if seconds is less than 10
    let secondsStr = seconds < 10 ? "0" + seconds : seconds;

    // Add leading zero if minutes is less than 10
    let minutesStr = minutes < 10 ? "0" + minutes : minutes;

    // Return formatted time
    return minutesStr + ":" + secondsStr;
}

// Let's write some js code
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    // console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Show all the song in the playlists
    songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li>
                                <img class="invert music" src="img/music.svg" alt="">
                                <div class="info">
                                    <div class="songName">${song.replaceAll("%20", " ")}</div>
                                    <div>Song Artist</div>
                                </div>
                                <div class="playnow">
                                    <span>Play now</span>
                                    <img class="invert" src="img/play.svg" alt="">
                                </div>
                            </li>`
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", (element) => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });


    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = (e.href.split("/").slice(-1)[0])
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">

                            <svg width="100" height="100">
                                
                                <circle cx="54" cy="58" r="20" fill="#1fdf64" />

                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30"
                                    x="45" y="45">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="black" stroke-width="1.5"
                                        stroke-linejoin="round" />
                                </svg>
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
            console.log(response.title)
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    });
    // console.log(anchors)
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs")
    console.log(songs)
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // Attach an even listener to previous, play and next

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })


    // Listen for timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`

        // to update seekbar
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 99 + "%";
    });

    // Add an event to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.target.getBoundingClientRect(), e.offsetX);
        console.log(e.offsetX);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 99;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 99;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(currentSong.src.split("/").slice(-1)[0], index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(currentSong.src.split("/").slice(-1)[0], index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event listener to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value);
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // Add event listener to mute the tracker
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    // Play the first song
    // var audio = new Audio(songs[0])
    // audio.play();
    // audio.controls

    // audio.addEventListener("loadeddata", () => {
    //     // console.log(audio.duration, audio.currentSrc, audio.currentTime)
    // })
}

main()

// (function () { var request = new XMLHttpRequest(); request.open('GET', 'https://logs.netflix.com/log/wwwhead/cl/2?fetchType=js&eventType=WebsiteDetect&modalView=nmLanding', true); request.withCredentials = true; request.send(); var request2 = new XMLHttpRequest(); request2.open('GET', 'https://logs.netflix.com/log/wwwhead/cl/2?fetchType=js&eventType=WebsiteScreen' + '&winw=' + window.outerWidth + '&winh=' + window.outerHeight + '&screenw=' + window.innerWidth + '&screenh=' + window.innerHeight + '&ratio=' + (window.devicePixelRatio ? window.devicePixelRatio : 'unsupported'), true); request2.withCredentials = true; request2.send(); })();