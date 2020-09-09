import { Mongo } from 'meteor/mongo';

export const Docs = new Mongo.Collection('links');
import {Meteor} from "meteor/meteor";
import Delta from 'quill-delta'
Meteor.methods({
  userEditedDocument(docId, change){
    // We don't really do any access control, knowing the id of
    // a doc means we own it or have been invited to it.
    const doc = Docs.findOne(docId)

    Docs.update(docId,{
      $set:{
        // The new content is the old content with the fix applied
        content:new Delta(doc.content).compose(change),
        // I've set this and the edits count up to let me free space later
        // by deleting old documents that we never edited or are quite old
        lastEdit:new Date(),
      },
      $inc:{
        edits:1
      }
    })
  }
})

