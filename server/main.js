import { Meteor } from 'meteor/meteor';
import { Docs } from '/imports/api/Docs';

import { Random } from 'meteor/random'


Meteor.publish('docById', function (id) {

  if(! Docs.findOne(id)){
      Docs.insert({
        _id:id,
      createdAt:new Date(),
      parts:[ {
        id:Random.id(),
        text:'You can edit this text by clicking it. Share the url to let your friends edit it too.'
      }]
    })
  }
  return Docs.find(id)

})

