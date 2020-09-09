import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App';
import { Random } from 'meteor/random'

Meteor.startup(() => {
  let id=window.location.pathname.slice(1)
  if(!id){
    id=Random.id()
    history.replaceState(null, '', '/'+id)
  }
  const userId=Random.id()
  render(<App docId={id} userId={userId}/>, document.getElementById('react-target'));
});
