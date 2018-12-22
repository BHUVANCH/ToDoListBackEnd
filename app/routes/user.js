const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const listController = require("./../../app/controllers/listController");
const appConfig = require("./../../config/appConfig")
const auth = require('../middlewares/authmiddleware');

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;




    app.post(`${baseUrl}/login`, userController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
         @apiErrorExample {object} Error-Response:
        *
        * {
            "error": true,
            "message": "Error Occured",
            "status": 500,
            "data": null
        }
    */

    // auth token params: userId.
    app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/logout to logout user.
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null

        }
        @apiErrorExample {object} Error-Response:
        *
        * {
            "error": true,
            "message": "Error Occured",
            "status": 500,
            "data": null
        }
    */


    app.post(`${baseUrl}/signup`, userController.signUpFunction);

/**
 * @apiGroup users
 * @apiVersion  1.0.0
 * @api {post} /api/v1/signup api for user signup.
 *
 * @apiParam {string} email email of the user. (body params) (required)
 * @apiParam {string} password password of the user. (body params) (required)
 * @apiParam {string} firstName firstName of the user. (body params) (required)
 * @apiParam {string} lastName lastName of the user. (body params) (required)
 * @apiParam {string} mobileNumber mobileNumber of the user. (body params) (required)
 * @apiParam {string} userType userType of the user. (body params) (required)
 *
 * @apiSuccess {object} myResponse shows error status, message, http status code, result.
 * 
 * @apiSuccessExample {object} Success-Response:
     {
        "error": false,
        "message": "User Created",
        "status": 200,
        "data": {
            "CreatedOn": "2018-11-20T09:32:50.000Z"
            "mobileNumber": 2234435524,
            "email": "someone@mail.com",
            "lastName": "Sengar",
            "firstName": "Rishabh",
            "userId": "-E9zxTYA8",
            "userType": "User",
            "resetPassword": "",
            "resetPasswordCreation": ""
    }
      @apiErrorExample {object} Error-Response:
        *
        * {
            "error": true,
            "message": "Error Occured",
            "status": 500,
            "data": null
        }
*/



app.post(`${baseUrl}/forgot`, userController.forgotPassword);

/**
 * @apiGroup users
 * @apiVersion  1.0.0
 * @api {post} /api/v1/forgot api for user forgot.
 *
 * @apiParam {string} appurl appurl of the user. (body params) (required)
 * @apiParam {string} email email of the user. (body params) (required)
 *
 * @apiSuccess {object} myResponse shows error status, message, http status code, result.
 * 
 * @apiSuccessExample {object} Success-Response:
     {
        "error": false,
        "message": "email sent",
        "status": 200,
        "data": {
            "Token": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
            "email": "someone@mail.com",
        }

    }
        @apiErrorExample {object} Error-Response:
        *
        * {
            "error": true,
            "message": "Error Occured",
            "status": 500,
            "data": null
        }
*/


app.post(`${baseUrl}/savePassword`, userController.savePassword);

/**
 * @apiGroup users
 * @apiVersion  1.0.0
 * @api {post} /api/v1/savePassword api for save Password.
 *
 * @apiParam {string} email email of the user. (body params) (required)
 * @apiParam {string} password password of the user. (body params) (required)
 *
 * @apiSuccess {object} myResponse shows error status, message, http status code, result.
 * 
 * @apiSuccessExample {object} Success-Response:
     {
        "error": false,
        "message": "updated user",
        "status": 200,
        "data": {
            "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
            "userDetails": {
            "mobileNumber": 2234435524,
            "email": "someone@mail.com",
            "lastName": "Sengar",
            "firstName": "Rishabh",
            "userId": "-E9zxTYA8"
        }

    }
        @apiErrorExample {object} Error-Response:
     *
     * {
            "error": true,
            "message": "Error Occured",
            "status": 500,
            "data": null
        }
*/



app.post(`${baseUrl}/setUserlists`,auth.isAuthorized, listController.setList);

app.post(`${baseUrl}/getUserLists`,auth.isAuthorized, listController.getOnlyUserLists);

app.post(`${baseUrl}/gettaskList`,auth.isAuthorized, listController.gettaskList);

app.post(`${baseUrl}/settaskList`,auth.isAuthorized, listController.settaskList);


app.post(`${baseUrl}/updateUser`,auth.isAuthorized, userController.updateUser);

app.get(`${baseUrl}/deleteall`,auth.isAuthorized, listController.deleteEvents);


    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/userlist api for user List.
     *
     * @apiParam {string} authToken email of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Success",
            "status": 200,
            "data": [
                {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }, {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }
        ]
        }
        @apiErrorExample {object} Error-Response:
        *
        * {
            "error": true,
            "message": "Error Occured",
            "status": 500,
            "data": null
        }
    */

// app.post(`${baseUrl}/delete`, auth.isAuthorized, calenderController.deleteEvents);

    /**
* @apiGroup users
* @apiVersion  1.0.0
* @api {post} /api/v1/delete api for delete.
*
* @apiParam {string} email email of the user. (body params) (required)
* @apiParam {string} password password of the user. (body params) (required)
*
* @apiSuccess {object} myResponse shows error status, message, http status code, result.
* 
* @apiSuccessExample {object} Success-Response:
 {
    "error": false,
    "message": "Success",
    "status": 200,
    "data": null

}
 @apiErrorExample {object} Error-Response:
 *
 * {
      "error": true,
      "message": "Error Occured",
      "status": 500,
      "data": null
    }
*/

}
