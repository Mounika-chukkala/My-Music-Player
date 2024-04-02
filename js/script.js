let currentSong = new Audio();
let songs;
let currfolder;
let play = document.getElementById("play");
let prev = document.getElementById("prev");
let next = document.getElementById("next");
let vbtn = document.querySelector("#vbtn");
let playlist=document.querySelector(".spotifyPlaylists")
function secondsToMinutes(seconds) {
  if(isNaN(seconds) || seconds<0){
      return "00:00"
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const fSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${fSeconds}`;
}
async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];songs
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `
    <li>
                     
    <img src="images/music.svg" class="music">
    <div class="info">
        <p class="songname">${song.replaceAll("%20", " ")}</p>
        <p>song artists</p>
    </div>

    <img src="images/controlsplay.svg" class="music">
</li>
`;
  }
  console.log(songs)
  playSongs(songs[0].replaceAll("%20", " "), true);
  let lis = document.querySelector(".songlist").getElementsByTagName("li");
  Array.from(lis).forEach((e) => {
    e.addEventListener("click", (element) => {
      playSongs(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
}
const playSongs = (music, pause = false) => {
  currentSong.src = `/${currfolder}/` + music;
  if (!pause) {
    currentSong.play();
    currentSong.volume = 0.5;
    play.src = "images/pause.svg";
    document
      .querySelector(".range")
      .getElementsByTagName("input")[0].value = 50;
  }
  document.querySelector(".songinfo").innerHTML = `Song : ${music.replaceAll(
    "%20",
    " "
  )}`;
  document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
    currentSong.currentTime
  )}/${secondsToMinutes(currentSong.duration)}`;
  // audio.play()
};

async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
 let div = document.createElement("div");
  div.innerHTML=response;
  let anchors=div.getElementsByTagName("a");
 let array= Array.from(anchors)
 for (let index = 0; index < array.length; index++) {
  const e = array[index]; 
    if(e.href.includes("/songs/")){
      
      // folders.push(e.href.split("/").slice(-2)[0])
      // gettting meta data of the folder
      let folder=e.href.split("/").slice(-2)[1]
    
      let a = await fetch(`/songs/${folder}/info.json`);
  let response = await a.json();

   playlist.innerHTML+=`<div data-Folder="${folder}" class="card">
   <div class="playbutton">
      <img src="images/play.svg">
  </div>
      <img class="cardimg" src="/songs/${folder}/cover.jpg">
      <h3>${response.title}</h3>
      <p>${response.description}</p>
  </div>` 
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playSongs(songs[0])
    });
  });  
}


async function main() {
  await getSongs("songs/90s_hits");
displayAlbums()
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/controlsplay.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )}/${secondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
   
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    document.querySelector(".circle").style.left = percent + "%";
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".closebtn").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  prev.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    currentSong.pause();
    if (index - 1 < 0) {
      let x = songs.length - 1;
      playSongs(songs[x].trim());
    } else {
      playSongs(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    currentSong.pause();
    if (index == songs.length - 1) {
      playSongs(songs[0]);
    } else {
      playSongs(songs[index + 1]);
    }
  });
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("input", (e) => {
      let volume = parseInt(e.target.value) / 100;

      currentSong.volume = volume;
      if (volume === 0) {
        vbtn.src = "images/volumeoff.svg";
      } else if (volume > 0.4) {
        vbtn.src = "images/volumehigh.svg";
      } else {
        vbtn.src = "images/volume.svg";
      }
    });

  vbtn.addEventListener("click", (e) => {
  if(!e.target.src.includes("mute.svg")){
    
    e.target.src= e.target.src.replace(e.target.src.split("/").slice(-1)[0],"mute.svg");
    currentSong.volume = 0;
    document.querySelector(".range>input").disabled=true
    document.querySelector(".range>input").value=0
  }
  else{
    currentSong.volume=.30;
    e.target.src=e.target.src.replace("mute.svg","volume.svg");
    document.querySelector(".range>input").disabled=false;
    document.querySelector(".range>input").value=30 
  }
  });

 
}
main();
