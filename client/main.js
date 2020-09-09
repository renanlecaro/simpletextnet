import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random'
import { Tracker } from 'meteor/tracker'
import { Docs } from '/imports/api/Docs';

import Quill from 'quill/dist/quill.core.js'
import 'quill/dist/quill.core.css'

let setup=false

Meteor.startup(() => {
  let docId=window.location.pathname.slice(1)
  if(!docId){
    docId=Random.id()
    history.replaceState(null, '', '/'+docId)
  }


  let lastApplied=null
  const quill = new Quill('#editor')
  quill.on('text-change', function(delta, oldDelta, source) {
    if (source === 'user') {

      lastApplied= Random.id()
      Meteor.call('userDelta',docId, delta, lastApplied )
    }
  });

  Meteor.subscribe('docById',docId);

  Tracker.autorun(function () {
    const doc=Docs.findOne(docId)

    if(!doc) return
    console.debug(lastApplied+' vs '+doc.prevOpId)
    // We applied that change already
    if(lastApplied===doc.lastOpId) return console.debug('ignored')
    // We were on the same page
    if(lastApplied === doc.prevOpId){

      console.debug('update')
      // const sel=quill.getSelection()
      quill.updateContents(doc.lastOp,  'api')
      // quill.setSelection(sel,'api')
      lastApplied=doc.lastOpId
      return
    }

    console.debug('set')
    quill.setContents(doc.content,  'api')
    quill.blur()
    lastApplied=doc.lastOpId
    if(!setup){
      setup=true
      document.body.removeChild(document.getElementById('loadingText'))
    }
  })
});