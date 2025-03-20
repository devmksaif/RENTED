
const userModel = require('../models/users')

//addUser function
exports.addUser = (req, res) => {
    const userObj = {
      username: req.body.username,
      email: req.body.email,
      pwd: req.body.pwd,
    };
    const user = new userModel(userObj);
    user.save()
    .then(createdUser=>{
      res.status(200).json({createdUser})
    })
   .catch (error => {
    res.status(400).json({ error });
  })
}
//editUser func
exports.modiferUSer = (req, res) => {
    const param = req.params.id;
    const modifiedObj = {
        username: req.body.username,
        email: req.body.email,
        pwd: req.body.pwd,
    };
    contactModel.findByIdAndUpdate(param, modifiedObj)
    .then(() =>{
       res.status(200).json({message: "modifié avec succée"})
    })
    .catch(error =>{
       res.status(400).json({error})
    })
}

//delUSer func
exports.delUSer = (req, res) => {
    const param = req.params.id;
    userModel.findByIdAndDelete(param)
    .then(() => {res.status(200).json({message: `user ${param} supprimé avec succée`})})
    .catch((error) =>{res.status(400).json({error})})
}

//showUser func
exports.showUser = (req, res) => {
    userModel.find({})
        .then(userList =>{
          res.status(200).json({userList})
          })
        .catch(error =>{
          res.status(400).json( {error})
          })
    
  }