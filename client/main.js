import { Meteor } from 'meteor/meteor';
import {setupUI} from "../imports/ui/App";
import {renameMySelf} from "../imports/ui/userName";
Meteor.startup(setupUI);