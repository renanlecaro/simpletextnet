import { Meteor } from 'meteor/meteor';
import Importabular from "../imports/ui/Importabular";


document.getElementById('editor-wrap').style.display=''
document.getElementById('loadingText').style.display='none'
const instance = new Importabular({
  node:document.getElementById('editor'),
  data:[[1,'2',3,null],[4,2,0,'Hello']]
})

if(false){

  function setupButton(id, type){
    document.getElementById(id).addEventListener('click',function (e) {
      e.preventDefault()
      e.target.disabled=true
      Meteor.call('document.new',type , (err, newDocId)=>{
        e.target.disabled=false

        if(err) {
          console.error(err)
          return alert('Creation failed, details in javascript console')
        }
        window.location.pathname='/'+newDocId
      })
    })
  }
  Meteor.startup(function () {

    setupButton('new-text-document', 'plain_text');
    setupButton('new-sheet-document', 'sheet');


    let docId=window.location.pathname.slice(1)
    if(docId){
      Meteor.call('document.getType', docId, (err, type)=>{
        if(err) return alert('Failed to fetch document')
        if(type==='plain_text') import('/imports/ui/setupTextEditor').then(setup=>setup.default(docId));
        if(type==='sheet') import('/imports/ui/setupTableEditor').then(setup=>setup.default(docId));
      })
    }

  })
}