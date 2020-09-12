let userName = localStorage.getItem('userName')

function updateButton() {
  if(!userName) return
  document.getElementById('currentUserName').style.display='';
  const btn=document.getElementById('renameMySelf');
  btn.innerText=userName;
  btn.style=''
}

export function askForARealName() {
  if(!getUserName()) renameMySelf()
}

export function renameMySelf() {
  while(!(userName = prompt('Please enter your name, for other editors to know who you are.', userName||'')
    .replace(/[.<>"']/gi,' ').trim()));
  localStorage.setItem('userName',userName)
  updateButton()
}

updateButton()



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
