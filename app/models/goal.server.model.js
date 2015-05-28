'use strict';
/**
 * Created by: Robin Hansma (robin@ihatestatistics.com)
 * Date:       5-5-2015
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    SubgoalSchema = require('./subgoal.server.model.js');

/**
 * Goal Schema
 */
var GoalSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'Content must be provided'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Please login to create a goal'
  },
  expires: {
    type: Date,
    required: 'Make your goals SMART',
    validate: [dateInFutureValidation, 'Make sure your expiry date is in the future']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  subgoals: [SubgoalSchema],
  committed: {
    type: Number,
    min: 0,
    default: 0
  },
  finished: {
    type: Boolean,
    default: false
  },
  finishedDate: {
    type: Date
  },
  published: {
    type: Boolean,
    default: false
  }
});

/**
 * Run some validation before saving/updating
 */
GoalSchema.pre('validate', function(next) {
  /* Make sure goal is only published after a minimum rating of 5.5 */
  if (this.published && this.rating < 5.5) {
    this.published = false;
  }

  next();
});

/* Make sure date is in future */
function dateInFutureValidation(value) {
  return new Date() < value;
}

exports.GoalSchema; // jshint ignore:line
mongoose.model('Goal', GoalSchema);