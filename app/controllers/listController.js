const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('../libs/generatePasswordLib')
const crypto = require('crypto')

const nodemailer = require('nodemailer');
const socket = require('../libs/socketLib');
const cron = require('node-cron');
const token = require('../libs/tokenLib');


/* Models */
mongoose.Promise = require('bluebird');
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth');
const EventModel = mongoose.model('Event');
const ListModel = mongoose.model('List');


let setList = (req, res) => {
    console.log(req.body);
    console.log(req.body.userEmail, req.body.userId);
    ListModel.remove({ userEmail: req.body.userEmail, userId: req.body.userId })
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'listController: deleteuserlists', 10);
                let apiResponse = response.generate(true, 'Error Occured', 500, null)
                res.send(apiResponse);
            } else if (result == undefined || result == null || result == '') {
                console.log('No Users Found');
                logger.error('No Events Found', 'listController: deleteuserlists', 10);
                let apiResponse = response.generate(true, 'Not Found', 404, null)
                res.send(apiResponse);
            } else {
                console.log('success');
                console.log('--------------------------------here');
                let newList = new ListModel({
                    userEmail: req.body.userEmail,
                    userId: req.body.userId,
                    listdetails: JSON.parse(req.body.listdetails)
                });
                console.log('-------------------newList' + newList);
                newList.save((err, newList) => {
                    if (err) {
                        console.log(err);
                        logger.error(err.message, 'listController: setList', 10);
                        let apiResponse = response.generate(true, 'Failed to update List', 500, null);
                        res.send(apiResponse);
                    } else {
                        console.log('listSaved');
                        let apiResponse = response.generate(false, 'list updated', 200, newList);
                        res.send(apiResponse);
                    }
                })
            }
        })




} // end of createList

let getOnlyUserLists = (req, res) => {
    console.log(req.body.userEmail, req.body.userId);
    ListModel.findOne({ userEmail: req.body.userEmail})
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'listController: getOnlyUserLists', 10);
                let apiResponse = response.generate(true, 'Error Occured', 500, null)
                res.send(apiResponse);
            } else if (result == undefined || result == null || result == '') {
                console.log('No Events Found');
                logger.error('No Events Found', 'listController: getOnlyUserLists', 10);
                let apiResponse = response.generate(true, 'No Events Found', 200, null)
                res.send(apiResponse);
            } else {
                console.log('----------------');
                console.log(result);
                console.log('----------------');
                logger.error('User Found', 'listController: getOnlyUserLists', 0);
                let apiResponse = response.generate(false, 'success', 200, result);
                res.send(apiResponse);
            }
        })
}

let gettaskList = (req, res) => {
    console.log(req.body.listId);
    console.log(req.body.listName);
    EventModel.findOne({listId: req.body.listId , listName: req.body.listName})
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'listController: gettaskList', 10);
                let apiResponse = response.generate(true, 'Error Occured', 500, null)
                res.send(apiResponse);
            } else if (result == undefined || result == null || result == '') {
                console.log('No Events Found');
                logger.error('No Events Found', 'listController: gettaskList', 10);
                let apiResponse = response.generate(true, 'No Events Found', 404, null)
                res.send(apiResponse);
            } else {
                console.log('----------------');
                console.log(result);
                console.log('----------------');
                let apiResponse = response.generate(false, 'sucess', 200, result)
                res.send(apiResponse);
            }
        })
}

let settaskList = (req, res) => {
    console.log(req.body.listId, req.body.listName);
    EventModel.remove({ listId: req.body.listId, listName: req.body.listName })
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'listController: deleteuserlists', 10);
                let apiResponse = response.generate(true, 'Error Occured', 500, null)
                res.send(apiResponse);
            } else if (result == undefined || result == null || result == '') {
                console.log('No Users Found');
                logger.error('No Events Found', 'listController: deleteuserlists', 10);
                let apiResponse = response.generate(true, 'Not Found', 404, null)
                res.send(apiResponse);
            } else {
                console.log(req.body.taskArray);
                let newEvent = new EventModel({
                    listId: req.body.listId,
                    listName: req.body.listName,
                    shared: JSON.parse(req.body.shared),
                    taskArray: JSON.parse(req.body.taskArray),
                })
                console.log(newEvent.taskArray);
                newEvent.save((err, newEvent) => {
                    if (err) {
                        console.log(err);
                        logger.error(err.message, 'listController: setlist', 10);
                        let apiResponse = response.generate(true, 'Failed to set new list', 500, null);
                        res.send(apiResponse);
                    } else {
                        let apiResponse = response.generate(false, 'created new list', 200, newEvent);
                        res.send(apiResponse);
                    }
                })
            }
        })
} // end of settaskList

let deleteEvents = (req, res) => {
    ListModel.remove()
        .exec((err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'listController: deleteEvents', 10);
                let apiResponse = response.generate(true, 'Error Occured', 500, null)
                res.send(apiResponse);
            } else if (result == undefined || result == null || result == '') {
                console.log('No Users Found');
                logger.error('No Events Found', 'listController: deleteEvents', 10);
                let apiResponse = response.generate(true, 'Not Found', 404, null)
                res.send(apiResponse);
            } else {
                console.log('success');
                let apiResponse = response.generate(false, 'sucess', 200, null)
                res.send(apiResponse);
            }
        })
}



module.exports = {
    deleteEvents: deleteEvents,
    getOnlyUserLists: getOnlyUserLists,
    gettaskList: gettaskList,
    setList: setList,
    settaskList: settaskList,
}