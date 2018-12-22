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


/* Models */
const UserModel = mongoose.model('User')
const token = require('../libs/tokenLib');
const AuthModel = mongoose.model('Auth');
const EventModel = mongoose.model('Event');
const ListModel = mongoose.model('List');

// start user signup function 
let signUpFunction = (req, res) => {
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does Not Meet The Requirments', 500, null);
                    reject(apiResponse);
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'password Does Not Meet The Requirments', 500, null);
                    reject(apiResponse);
                } else {
                    resolve(req);
                }
            } else {
                logger.error('Field Missing During User creation', 'userController : createUser', 5);
                let apiResponse = response.generate(true, 'one or more parameters are missing', 500, null);
                reject(apiResponse);
            }
        })
    }; // end of validate user

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController : createUser', 10);
                        let apiResponse = response.generate(true, 'Failed to create User', 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }

                })
        }) // end of Promise
    }; //end of create user

    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User Created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })



}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {

    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log(req.body);
                console.log(req.body.email.toLowerCase());
                UserModel.findOne({ email: req.body.email.toLowerCase() }, (err, userDetails) => {
                    if (err) {
                        console.log(err);
                        logger.error('Failed to retrieve User', 'userController: Login', 4)
                        let apiResponse = response.generate(true, 'Failed to Find User', 403, null)
                        reject(apiResponse);
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'No User Found', 403, null)
                        reject(apiResponse);
                    } else {
                        logger.info(' User Found', 'userController: Login', 4)
                        resolve(userDetails);
                    }
                });
            } else {
                let apiResponse = response.generate(true, 'Email parameter is Missing', 403, null)
                reject(apiResponse);
            }
        })
    } // end of find User

    let validatePassword = (retrievedUserDetails) => {
        console.log('validatePassword');
        return new Promise((resolve, reject) => {
            console.log(req.body.password, retrievedUserDetails.password);
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err);
                    logger.error(err.message, 'userController: validatePasword', 10);
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse);
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject();
                    delete retrievedUserDetailsObj.password;
                    delete retrievedUserDetailsObj._id;
                    delete retrievedUserDetailsObj.__v;
                    delete retrievedUserDetailsObj.createdOn;
                    delete retrievedUserDetailsObj.modifiedOn;
                    resolve(retrievedUserDetailsObj);
                } else {
                    logger.info('Login Failed due to invalid Password', 'userController: validatePasword', 4)
                    let apiResponse = response.generate(true, 'Worng password Login Failed', 400, null)
                    reject(apiResponse);
                }
            })

        })
    }


    let generateToken = (userDetails) => {
        console.log('generate Token');
        console.log(userDetails);
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err);
                    let apiResponse = response.generate(true, 'Failed to Generate Token', 403, null)
                    reject(apiResponse);
                } else {
                    tokenDetails.userId = userDetails.userId;
                    tokenDetails.userDetails = userDetails;
                    resolve(tokenDetails);
                }
            })
        })
    } // end of generate  token

    let saveToken = (tokenDetails) => {
        console.log('saveToken');
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedUserDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10);
                    let apiResponse = response.generate(true, 'Failed to Generate Token', 403, null)
                    reject(apiResponse);
                } else if (check.isEmpty(retrievedUserDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    });
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err);
                            logger.info(err.message, 'userController: saveToken', 4)
                            let apiResponse = response.generate(true, 'Failed to Generate Token', 500, null)
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    })
                } else {
                    retrievedUserDetails.authToken = tokenDetails.token
                    retrievedUserDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedUserDetails.tokenGenerationTime = time.now()
                    retrievedUserDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err);
                            logger.error(err.message, 'userController: saveToken', 4)
                            let apiResponse = response.generate(true, 'Failed to Generate Token', 500, null)
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    })

                }
            });
        });

    }

    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Login Successuful', 200, resolve)
            res.status(200);
            res.send(apiResponse);
        })
        .catch((err) => {
            console.log('errorHandler');
            console.log(err);
            res.status(err.status);
            res.send(err);
        })


}// end of the login function 

let forgotPassword = (req, res) => {
    console.log('forgot Password email: ' + req.body.email);
    let token = '';
    crypto.randomBytes(20, (err, buf) => {
        token = buf.toString('hex');
    })
    console.log(token);
    if (req.body.email) {
        console.log(req.body);
        UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
            if (err) {
                console.log(err);
                logger.error('Failed to retrieve User', 'userController: forgotPassword', 4)
                let apiResponse = response.generate(true, 'Failed to Find User', 403, null)
                res.send(apiResponse);
            } else if (check.isEmpty(userDetails)) {
                logger.error('No User Found', 'userController: forgotPassword', 4)
                let apiResponse = response.generate(true, 'No User Found', 403, null)
                res.send(apiResponse);
            } else {
                logger.info(' User Found', 'userController: forgotPassword', 4)
                let link = req.body.url + 'reset/' + token;
                mail(req.body.email, link);
                let data = {
                    email: req.body.email,
                    token: token
                }
                let apiResponse = response.generate(false, 'email sent', 200, data);
                console.log(apiResponse);
                res.send(apiResponse);
            }
        });
    } else {
        let apiResponse = response.generate(true, 'Email parameter is Missing', 403, null)
        res.send(apiResponse);
    }
}
let mail = (email, link) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'webtech607@gmail.com',
            pass: 'Angularnode'
        }
    });

    var mailOptions = {
        to: email,
        from: 'webtech607@gmail.com',
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            link + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    if (link.includes("Admin")) {
        mailOptions.subject = 'Event Alert';
        mailOptions.text = link + '\n\n' + 'Pease Login to your Account to check Details' + '\n\n';

    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            let apiResponse = response.generate(true, 'Error in sending mail', 403, null)
            res.send(apiResponse);
        } else {
            console.log('Email Sent');
            // let apiResponse = response.generate(false, 'email sent', 200, token);
            // console.log(apiResponse);
            // res.send(apiResponse);
        }
    })
}

let savePassword = (req, res) => {
    UserModel.findOne({ email: req.body.email })
        .exec((err, retrievedUserDetails) => {
            if (err) {
                logger.error(err.message, 'userController : savePassword', 10);
                let apiResponse = response.generate(true, 'Failed to save Password', 500, null);
                res.send(apiResponse);
            } else {
                console.log(req.body)
                retrievedUserDetails.password = passwordLib.hashpassword(req.body.password);
                retrievedUserDetails.save((err, updatedUserDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'userController: savePassword', 10)
                        let apiResponse = response.generate(true, 'Failed to save User', 500, null)
                        res.send(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'updated User', 200, updatedUserDetails)
                        res.send(apiResponse)
                    }
                })
            }

        });
}

let updateUser = (req, res) => {
    console.log(req.body);

    UserModel.findOne({ email: req.body.userEmail }, (err, userDetails) => {
        console.log('-------------------' + req.body.userEmail);
        if (err) {
            console.log(err);
            logger.error('Failed to retrieve User', 'userController: forgotPassword', 4)
            let apiResponse = response.generate(true, 'Failed to Find User', 403, null)
            res.send(apiResponse);
        } else if (check.isEmpty(userDetails)) {
            logger.error('No User Found', 'userController: forgotPassword', 4)
            let apiResponse = response.generate(true, 'No User Found', 403, null)
            res.send(apiResponse);
        } else {
            logger.info(' User Found', 'userController: forgotPassword', 4)
            updateList(userDetails, req.body);
        }
    });

    let updateList = (userDetails, listcontent) => {
        console.log(userDetails, listcontent);
        ListModel.findOne({ userEmail: listcontent.userEmail }, (err, result) => {
            if (err) {
                console.log(err);
                logger.error(err.message, 'userController: updateUser', 10);
                let apiResponse = response.generate(true, 'Error Occured', 500, null)
                res.send(apiResponse);
            } else if (result == undefined || result == null || result == '') {
                console.log('No user Found');
                logger.error('No user Found', 'userController: updateUser', 10);
                let obj = [{
                    listId: listcontent.listId,
                    listName: listcontent.listName,
                }];
                let updateobj = JSON.stringify(obj);
                console.log(updateobj);

                let newList = new ListModel({
                    userId: userDetails.userId,
                    userEmail: userDetails.userEmail,
                    listdetails: JSON.parse(updateobj)
                });
                console.log(newList);
                newList.save((err, newList) => {
                    if (err) {
                        console.log(err);
                        logger.error(err.message, 'UserController: setupdate', 10);
                        let apiResponse = response.generate(true, 'Failed to update List', 500, null);
                        res.send(apiResponse);
                    } else {
                        let apiResponse = response.generate(false, 'list updated', 200, newList);
                        res.send(apiResponse);
                    }
                })


            } else {
                console.log('----------------');
                console.log(typeof (result.listdetails) + '------------------------');
                console.log(result.listdetails);
                let obj = {
                    listId: listcontent.listId,
                    listName: listcontent.listName,
                }
                let updateobj = JSON.stringify(obj);
                result.listdetails.push(JSON.parse(updateobj));
                console.log(result.listdetails);

                ListModel.update({ userEmail: listcontent.userEmail }, { $set: { listdetails: result.listdetails } }, (err, result) => {
                    if (err) {
                        console.log(err);
                        let apiResponse = response.generate(true, 'Error Occured : update', 500, null)
                        res.send(apiResponse);
                    } else if (result == undefined || result == null || result == '') {
                        console.log('No Blog Found');
                        let apiResponse = response.generate(true, 'Not Found UserList', 404, null)
                        res.send(apiResponse);
                    } else {
                        let apiResponse = response.generate(false, 'updated', 200, result)
                        res.send(apiResponse);
                    }
                })
            }
        })
    }

}



let sendMail = (req, res) => {
    console.log(req.body.userId);
    UserModel.findOne({ userId: req.body.userId }, (err, result) => {
        if (err) {
            console.log(err);
            let apiResponse = response.generate(true, 'Error Occured : logout', 500, null)
            res.send(apiResponse);
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found');
            let apiResponse = response.generate(true, 'Not Found User', 404, null)
            res.send(apiResponse);
        } else {
            mail(result.email, req.body.message);
            let apiResponse = response.generate(false, 'mail sent', 200, result)
            res.send(apiResponse);
        }
    })

} // end of the sendMail function.




let logout = (req, res) => {
    console.log(req.body.userId);
    AuthModel.findOneAndRemove({ userId: req.body.userId }, (err, result) => {
        if (err) {
            console.log(err);
            let apiResponse = response.generate(true, 'Error Occured : logout', 500, null)
            res.send(apiResponse);
        } else if (result == undefined || result == null || result == '') {
            console.log('No Blog Found');
            let apiResponse = response.generate(true, 'Not Found User', 404, null)
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(false, "Logged Out Successfully", 200, null)
            res.send(apiResponse);
        }
    })

} // end of the logout function.


module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    forgotPassword: forgotPassword,
    savePassword: savePassword,
    sendMail: sendMail,
    updateUser: updateUser,

}// end export