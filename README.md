# Open source collaborative text editor

This is a barebone implementation of a collaborative text editor, that you can try here
https://txt.lecaro.me/

When you open the homepage, you get a new document with a unique URL. 
You can edit it (plain text only). You can share the URL and your friends will also 
be able to edit it.

You cannot share a "read only" version, this is by design, the use case is 10 friends 
in a whatsapp group preparing a BBQ and trying to organise who brings what. It's not
content distribution to 1000th of people.

The tech stack is very prototype friendly, so this project has very few lines of code.
It's based on [MeteorJS](https://www.meteor.com/) + [Quill](https://quilljs.com/).