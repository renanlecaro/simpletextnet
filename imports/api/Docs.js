import { Mongo } from 'meteor/mongo';

export const Docs = new Mongo.Collection('links');
import {Meteor} from "meteor/meteor";
import Delta from 'quill-delta'
Meteor.methods({
  userDelta(docId, change, opId ){
    const doc = Docs.findOne(docId)
    let delta = new Delta(doc.content)
      .compose(change)

    Docs.update(docId,{
      $set:{
        content:delta,
        lastOp:change,
        lastOpId:opId,
        prevOpId:doc.lastOpId,
        lastEdit:new Date(),
      },
      $inc:{
        edits:1
      }
    })
  }
})

