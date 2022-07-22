const { Types } = require("mongoose");
const List = require("../models/List");

exports.store = async(req,res)=> {

    try {
        let list = await List.create({...req.body,userId : req.user.userId});
        res.code(201).send({
            message : 'new list has been created',
            status : true,
            list,
        });
    } catch (error) {
            console.log(error);
            res.code(409).send({
                message : error.toString(),
                status : false,
            });
    }
};

exports.update = async(req,res)=> {
    let {emails, title} = req.body;
    try {
        let list = await List.findOneAndUpdate({
            _id : Types.ObjectId(req.params.id),
        },{emails, title});
        res.code(201).send({
            message : 'list has been updated',
            status : true,
            list,
        });
    } catch (error) {
            console.log(error);
            res.code(409).send({
                message : error.toString(),
                status : false,
            });
    }
};

exports.index = async(req,res)=> {

    try {
        let lists = await List.find({
            userId : Types.ObjectId(req.user.userId),
        });

        res.send({
            lists
        });
    } catch (error) {
            console.log(error);
            res.code(409).send({
                message : error.toString(),
                status : false,
            });
    }
};

exports.show = async(req,res)=> {

    try {
        let list = await List.findById(req.params.id);

        res.send({
            list
        });
    } catch (error) {
            console.log(error);
            res.code(409).send({
                message : error.toString(),
                status : false,
            });
    }
};