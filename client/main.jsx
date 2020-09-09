import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App';
import { Random } from 'meteor/random'

Meteor.startup(() => {
  let docId=window.location.pathname.slice(1)
  if(!docId){
    docId=Random.id()
    history.replaceState(null, '', '/'+docId)
  }
  const userId=Random.id()

  render(<App docId={docId} userId={userId}/>, document.getElementById('editor'));
});
