import { Mongo } from 'meteor/mongo';

export const Docs = new Mongo.Collection('links');
import {isDebug} from "../isDebug";
import {Meteor} from "meteor/meteor";
import Delta from 'quill-delta'
Meteor.methods({
  userDelta(docId, change, opId ){
    const doc = Docs.findOne(docId)
    const delta = new Delta(doc.content).compose(change)
    Docs.update(docId, {$set:{
      content:delta.ops,
        lastOpId:opId,
        lastOp:change,
        prevOpId:doc.lastOp
      }})
  }
})
