
let userName = localStorage.getItem('userName')

function updateButton() {

  document.getElementById('currentUserName').style.display='';
  const btn=document.getElementById('renameMySelf');
  btn.innerText=userName;
  btn.style=''
}

export function renameMySelf() {
  while(!(userName = prompt('Please enter your name', userName||'')
    .replace(/[^a-z0-9 _-]/gi,'').trim()));
  localStorage.setItem('userName',userName)
  updateButton()
}
if(!userName) {
  renameMySelf()
}else{
  updateButton()
}


export function getUserName() {
  return userName
}
export function userColor(userName, opacity=1) {
  return `hsla(${hash(userName)%360}, 100%, 50%, ${opacity})`
}
function hash(str) {
  var hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
