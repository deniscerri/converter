var main = document.querySelector('.main');
var loader = document.querySelector('.loader');

var mp3Btn = document.querySelector('#mp3-button');
mp3Btn.style.display = 'none';

var mp4Btn = document.querySelector('#mp4-button');
mp4Btn.style.display = 'none';

var playlistBtn = document.querySelector('#playlist-button')
playlistBtn.style.display = 'none';

var URLinput = document.querySelector('.URL-input');
var searchBtn = document.querySelector('#search-button')
var headerImg = document.querySelector('div[class="headerImage"] > img');

window.addEventListener("pageshow", () => {
  URLinput.value = "";
  URLinput.focus();
});

var source = 'yt';

URLinput.addEventListener('input', inputQuery)
mp3Btn.addEventListener("click", function(){downloadMp3(this.id)})
mp4Btn.addEventListener("click", function(){downloadMp4(this.id)})
searchBtn.addEventListener("click", function(){
  if(URLinput.value == ''){
    alert('Please write something on the search bar first. :)');
    return;
  }

  let request = new XMLHttpRequest();
  let url = `https://denisytdl.herokuapp.com/search/?Query=${URLinput.value}`;
  
  request.open('GET', url);
  request.responseType = 'text';
  request.onload = function() {
    let info = request.response;
    let json = JSON.parse(info);
    removeResults();
    addResults(json);
  };
  request.send();
})
URLinput.addEventListener("keypress", function(e){
  if(e.keyCode === 13){
    if(playlistBtn.style.display == 'none'){
      searchBtn.click();
    }else if(searchBtn.style.display == 'none'){
      playlistBtn.click();
    }
  }
})
playlistBtn.addEventListener("click", function(){
  if(URLinput.value == ''){
    alert('Please write something on the search bar first. :)');
    return;
  }
  
  let playlistID = getPLaylistID(URLinput.value);

  let request = new XMLHttpRequest();
  let url = `https://denisytdl.herokuapp.com/ytPlaylist/?id=${playlistID}`;
  
  request.open('GET', url);
  request.responseType = 'text';
  request.onload = function() {
    let info = request.response;
    let json = JSON.parse(info);
    removeResults();
    addResults(json);
  };
  request.send();
})

//downloadMp3 and downloadMp4 functions work for both link and list results.
function downloadMp3(id){
  if(!id.startsWith('http')){
    id = URLinput.value;
  }
  console.log('Downloading: '+id);
  let link = `http://denisytdl.herokuapp.com/download/${source}/?URL=${id}`;
  window.location.href = link;

}

function downloadMp4(id){
  if(!id.startsWith('http')){
    id = URLinput.value;
  }
  console.log('Downloading: '+id);
  let link = `http://denisytdl.herokuapp.com/download/MP4?URL=${id}`
  window.location.href = link;
}

//Show correct style and buttons for the input given
function inputQuery(e){
  let input = e.target;

  input.style.border = "1px solid #0485ff";
  mp3Btn.style.background = "#cc0000";
  mp3Btn.style.border = "2px solid #cc0000";
  searchBtn.style.display = 'inline-flex';

  mp3Btn.style.display = 'none';
  mp4Btn.style.display = 'none';
  playlistBtn.style.display = 'none';

  headerImg.src = '';
  headerImg.style.display = 'none';

  source = 'yt';

  //if we delete and input is empty we show red around the bar
  if (input.value == '') {
    input.style.border = "1px solid #FF0000";
  }

  //if its a soundcloud link
  if((input.value).startsWith('https://soundcloud.com/')){
      //we give a soundcloud themed color around the search bar
      //we hide the search button
      input.style.border = "1px solid #FF8C00";
      searchBtn.style.display = 'none';
      mp3Btn.style.display = 'inline-flex';
      
      //color the mp3 button like the spotify color and hide the mp4 button because we dont need it
      mp3Btn.style.background = '#FF8C00';
      mp3Btn.style.border = "2px solid #FF8C00";
      mp4Btn.style.display = "none";

      //we show the soundcloud logo
      headerImg.src='../logos/sc.png'
      headerImg.style.display = 'block';
      source = 'sc';
  }

  //if its a spotify link
  if((input.value).startsWith('https://open.spotify.com/')){
    //we give a spotify themed color around the search bar
    //we hide the search button
    input.style.border = "1px solid #1DB954";
    searchBtn.style.display = 'none';
    mp3Btn.style.display = 'inline-flex';

    //color the mp3 button like the spotify color and hide the mp4 button because we dont need it
    mp3Btn.style.background = '#1DB954';
    mp3Btn.style.border = "2px solid #1DB954";
    mp4Btn.style.display = "none";

    //we show the spotify logo
    headerImg.src='../logos/sp.png'
    headerImg.style.display = 'block';
    source = 'sp'
  }

  //if its a youtube link 
  if((input.value).startsWith('https://youtu') || (input.value).startsWith('https://www.youtu')){
    //if its a youtube playlist link we show the playlist button that lists the videos
    if((input.value).includes('&list=') || (input.value).includes('?list=')){
      playlistBtn.style.display = 'inline-flex';
    }else{
    //if its a normal video link we just show the mp3 and mp4 button
      playlistBtn.style.display = 'none';
      mp3Btn.style.display = 'inline-flex';
      mp4Btn.style.display = 'inline-flex';
    }
    //either way we hide the search button
    searchBtn.style.display = 'none';

    //we show the youtube logo
    headerImg.src='../logos/yt.png'
    headerImg.style.display = 'block';
  }

}

function addResults(json){

  json = fixElements(json);

  if(json.error != undefined){
    alert(json.error.message);
    return;
  }

  var resultsDiv = document.querySelector('.resultsArea');
  var item = document.querySelector('.results-item');
  for(var i = 0;i<json.items.length;i++){

    if(json.items[i].id.kind == 'youtube#video' || json.items[i].kind == 'youtube#playlistItem'){
      var clone = item.cloneNode(true);
      //add image and length
      clone.childNodes[1].childNodes[1].src = `https://img.youtube.com/vi/${json.items[i].id.videoId}/mqdefault.jpg`;
      clone.childNodes[1].childNodes[3].innerHTML = json.items[i].snippet.length;
      //add title,Channel name,Video Views and Release Date
      clone.childNodes[3].childNodes[1].innerHTML = json.items[i].snippet.title;
      clone.childNodes[3].childNodes[3].childNodes[1].innerHTML = json.items[i].snippet.channelTitle;
      clone.childNodes[3].childNodes[3].childNodes[3].innerHTML = json.items[i].snippet.views;
      clone.childNodes[3].childNodes[3].childNodes[5].innerHTML = json.items[i].snippet.publishTime;
      //add youtube videoID to the buttons
      if(json.items[i].kind == 'youtube#playlistItem'){
        clone.childNodes[3].childNodes[5].id = 'https://youtube.com/watch?v=' + json.items[i].snippet.resourceId.videoId;
        clone.childNodes[3].childNodes[7].id = 'https://youtube.com/watch?v=' + json.items[i].snippet.resourceId.videoId;
      }else{
        clone.childNodes[3].childNodes[5].id = 'https://youtube.com/watch?v=' + json.items[i].id.videoId;
        clone.childNodes[3].childNodes[7].id = 'https://youtube.com/watch?v=' + json.items[i].id.videoId;
      }
      
      resultsDiv.appendChild(clone);
    }
  }
  
  console.log('Finished showing results');

}

function fixElements(json){
//fix timestamp======================================================
  for(i in json.items){
    if(json.items[i].id.kind == 'youtube#video' || json.items[i].kind == 'youtube#playlistItem'){
      //REMOVE PT and S from timestamp
      let tmp = json.items[i].snippet.length;
      tmp = tmp.substring(2, tmp.length-1)
      //REMOVE hours and minutes tags
      tmp = tmp.replace(/[\H\M]/g,':')
      //putting element in array to fix bad formatted seconds or minutes, if they are single digit
      let arr = tmp.split(':');

      for(j in arr){
        if(arr[j]<10){
          arr[j] = '0'+arr[j];
        }
      }

      //turning the array back to string and replacing commas back to :
      tmp = arr.toString();
      tmp = tmp.replace(/[\,]/g,':')

      //if array element has value 0, probably because timestamp wasnt extracted in the first place
      //we put empty value so we dont show it at all
      if(tmp == 0){
        tmp = ''
      }

      json.items[i].snippet.length = tmp;
    }
  }

//fix view count=====================================================
  for(i in json.items){
    if(json.items[i].id.kind == 'youtube#video' || json.items[i].kind == 'youtube#playlistItem'){
      let views = json.items[i].snippet.views;
      if(views >= 1000000000){
        views = Math.floor(views/1000000000) + 'B views';
      }
      if(views >= 1000000){
        views = Math.floor(views/1000000) + 'M views';
      }
      if(views >= 1000){
        views = Math.floor(views/1000) + 'K views';
      }
      if(views < 1000){
        views = views + ' views';
      }
      json.items[i].snippet.views = views;
    }
  }

//fix release date===================================================
  for(i in json.items){
    if(json.items[i].id.kind == 'youtube#video' || json.items[i].kind == 'youtube#playlistItem'){
      let date = (json.items[i].snippet.publishTime).split('-');
      let day = date[2].split('T');
      date[2] = day[0];
      console.log(date);
      let videoDateInSeconds = new Date(`${date[0]}, ${date[1]}, ${date[2]}, 00:00`);
      let currentDate = new Date();

      var interval = Math.abs(currentDate - videoDateInSeconds) / 1000;
      let tmpInterval = interval;
      interval = interval / 31536000;
      console.log(interval)

      if (interval > 1) {
        json.items[i].snippet.publishTime = Math.floor(interval) + " years ago";
        continue;
      }
      interval = tmpInterval;
      interval = interval / 2592000;
      if (interval > 1) {
        json.items[i].snippet.publishTime = Math.floor(interval) + " months ago";
        continue;
      }
      interval = tmpInterval;
      interval = interval / 86400;
      if (interval > 1) {
        json.items[i].snippet.publishTime = Math.floor(interval) + " days ago";
        continue;
      }
      interval = tmpInterval;
      interval = interval / 3600;
      if (interval > 1) {
        json.items[i].snippet.publishTime = Math.floor(interval) + " hours ago";
        continue;
      }
      interval = tmpInterval;
      interval = interval / 60;
      if (interval > 1) {
        json.items[i].snippet.publishTime = Math.floor(interval) + " minutes ago";
        continue;
      }
      interval = tmpInterval;
      json.items[i].snippet.publishTime = Math.floor(interval) + " seconds ago";
    }
  }
  return json;
}

function removeResults(){
  var results = document.querySelectorAll('.results-item');
  if(results.length == 1){
    return;
  }else{
    for (let i = 1; i < results.length; i++) {
      results[i].remove();
    }
  }

  console.log('Finished deleting results')
}

function getPLaylistID(link){
  let parts = link.split('&');
  for(i in parts){
    if(parts[i].startsWith('list')){
      return parts[i].substring(5);
    }
  }
}

function sendFile(blob, fileName){
  var a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = fileName;
  a.dispatchEvent(new MouseEvent('click'));
}


