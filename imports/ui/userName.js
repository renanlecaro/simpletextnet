
export let userName = localStorage.getItem('userName')
if(!userName) {
  while(!(userName = prompt('Please enter a username (only letter and numbers, no space)')
    .trim().replace(/[^a-z0-9]/gi,'')));
  localStorage.setItem('userName',userName)
}

