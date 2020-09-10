import { Meteor } from 'meteor/meteor';
import { Docs } from '/imports/api/Docs';


Meteor.publish('docById', function (id) {

  return Docs.find(id)
})


