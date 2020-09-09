import { Meteor } from 'meteor/meteor';
import { Docs } from '/imports/api/Docs';

import { Random } from 'meteor/random'

const defaultText=`
This is a real time text editor. 

Share the url of this page with your friends and they'l be able to edit it it.

It's simple, free, ad-free. It doesn't try to track you. It works on mobile.

One day if it get popular there will be a premium version too, with more features.

`

Meteor.publish('docById', function (id) {

  if(! Docs.findOne(id)){
      Docs.insert({
      _id:id,
      createdAt:new Date(),
      content:[
          { insert:defaultText},
        ],

        lastOp:[],
        lastOpId:Random.id(),
        prevOpId:Random.id()
    })
  }
  return Docs.find(id)

})

