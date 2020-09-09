import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random'
import { Tracker } from 'meteor/tracker'
import { Docs } from '/imports/api/Docs';

import Quill from 'quill/dist/quill.core.js'
import 'quill/dist/quill.core.css'


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
    // We applied that change already
    if(lastApplied===doc.lastOpId) return
    // We were on the same page
    if(lastApplied === doc.prevOpId){
      quill.updateContents(doc.lastOp,  'api')
      lastApplied=doc.lastOpId
      return
    }

    quill.setContents(doc.content,  'api')
    document.body.removeChild(document.getElementById('loadingText'))
  })

});
