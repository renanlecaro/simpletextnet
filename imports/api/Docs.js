import { Mongo } from 'meteor/mongo';

export const Docs = new Mongo.Collection('links');
import {Meteor} from "meteor/meteor";
import Delta from 'quill-delta'


const defaultText=`
This is a real time text editor. 

Share the url of this page with your friends and they'l be able to edit it it.

It's simple, free, ad-free. It doesn't try to track you. It works on mobile.

One day if it get popular there will be a premium version too, with more features.

`

Meteor.methods({
  'document.getType'(docId){
    if(Meteor.isClient) return
    return Docs.findOne(docId).type || 'plain_text'
  },
  'document.new'(type){
    if(Meteor.isClient) return
    const content = {
      'plain_text'(){
       return [
          {content:{ insert:defaultText}},
        ]
      },
      'sheet'(){
        return {content:[
          ['Who', 'Comes ? ', 'Brings ..'],
          ['Foo', 'Yes', 'The grill'],
          ['Bar', 'Yes', 'Some coal'],
          ['Mickael', 'No', 'Nothing, obviously'],
        ], headers:[]}
      }
    }[type]();
    return Docs.insert({
      createdAt:new Date(),
      type,
      ...content,
      lastEdit:new Date(),
      edits:1,
      selections:{}
    })
  },
  'document.sheet.update'(docId, change){

    Docs.update({_id:docId, type:'sheet'},{
      $set:{
        // The new content is the old content with the fix applied
        ...change,
        // I've set this and the edits count up to let me free space later
        // by deleting old documents that we never edited or are quite old
        lastEdit:new Date(),
        lastChange:'content'
      },
      $inc:{
        edits:1
      }
    })
  },

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
        lastChange:'content'
      },
      $inc:{
        edits:1
      }
    })
  },
  'document.selection.update'(docId, userName, range){
    if(!range){
      Docs.update(docId,{
        $unset:{
          ['selections.'+userName]:''
        },
        $set:{
          lastChange:'selection'
        }
      })
    }
    else
    Docs.update(docId,{
      $set:{
        // The new content is the old content with the fix applied
        ['selections.'+userName]:{
          range, time:Date.now()
        },
        lastChange:'selection'
      },
    })
  }
})

