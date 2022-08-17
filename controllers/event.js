const moment = require("moment");
const Mail = require('../core/Mail/Mail');
const User = require("../models/User");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const EventCategory = require("../models/EventCategory");
const {
  refundPayment,
  createCustomerStripe,
  makePayment,
} = require("../services/stripe");
const Stripe = require('stripe');
const { Types } = require("mongoose");
const { view } = require("../core/helpers");
const EventInvitee = require("../models/EventInvitee");
const { delete_file } = require("../services/delete_file");
const File = require("../models/File");

exports.hostEvent = async (req, res) => {
  const session = await Event.startSession();
  let charge_id, total_global;
  session.withTransaction(async () => {
    try {
      const opts = { session };
      const {
        name,
        event_category: _event_category,
        date,
        time,
        guest_of_honor,
        event_elements,
        card : cardId,
      } = req.body;

      const event_category = await EventCategory.findById(_event_category);

      if (!event_category) throw new Error("Invalid Event Category");

      const total = event_category.cost;
      total_global = total;

      const user = await User.findById(req.user.userId).populate("auth");

      const event = new Event({
        user: user._id,
        event_category,
        name,
        date,
        time,
        guest_of_honor,
        event_elements,
        event_cost: total,
        event_type: "Subscription",
      });

      if (!event_category.inclueSubscription || !user.is_subscribed) {
        event.event_type = "Pay Per Event";
        event.save(opts);
        var charge_object = await user.charge(total,cardId); 
        event.savePaylogs(total,'Event Payment',charge_object,opts);

        // payment.charge_object = charge_object;
        charge_id = charge_object.id;
        
        /* if (charge_object.status === "succeeded") {
          payment.payment_status = "Payment Completed";
        } */

        // await payment.save(opts);
      } else {
        event.save(opts);
      }

      await session.commitTransaction();
      session.endSession();
      await res.code(201).send({
        status : true,
        event : event,
        message: (event_category.inclueSubscription || user.is_subscribed)
          ? "Event Created Using Subscription"
          : "Event Created Without Using Any Subscription",
      });
    } catch (err) {
      console.log(err);
      if (charge_id && total_global) {
        await refundPayment(charge_id, total_global);
      }
        await session.abortTransaction();
        session.endSession();            
          return res.code(409).send({
            message : error.toString(),
            status : false,
          });
      res.code(500).send({
        message: err.toString(),
      });
    }
  });
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? { name: { $regex: `${req.query.searchString}`, $options: "i" } }
      : {};

    let dateFilter = {};
    if (req.query.selected === "0")
      dateFilter = {
        date: {
          $gte: moment(new Date()).startOf("day"),
        },
      };
    else
      dateFilter = {
        date: {
          $lte: moment(new Date()).endOf("day"),
        },
      };

    const status_filter = req.query.status
      ? { event_type: req.query.status }
      : {};

    const user_filter_admin = req.query.user ? { user: req.query.user } : {};

    const event_category = req.query.event_category
      ? { event_category: req.query.event_category }
      : {};

    const logs = await Event.paginate(
      {
        ...dateFilter,
        ...searchParam,
        ...status_filter,
        ...event_category,
        ...user_filter_admin,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
        populate: {
          path: "user event_category",
          select: "name",
        },
      }
    );

    await res.code(200).send({
      logs,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).lean().populate({
      path: "event_category",
      select: "name",
    });

    await res.code(201).send({
      event,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};



exports.sendInvite = async (req,res)=> {
    let event;
    try {
      const {id} = req.params;
      let {emails}= req.body;
      event = await Event.findById(id).populate('user'); 
      let message = await view('invitation.ejs',{event});
      emails.forEach(async function(email){
          let invite = await EventInvitee.findOneAndUpdate({
            eventId : Types.ObjectId(id),
            email
          },{
            email,
          },{
            upsert : true,
          });
          console.log(invite);
      });
      const mail = new Mail();
      mail
      .bcc(req.body.emails)
      .subject(`Event: ${event.name} Invitation`)
      .message(message)
      .send()
      res.code(201).send({
        message : 'invitiation sent',
        status : true,
      });
    } catch (error) {
      console.log(error);
        res.code(404).send({
          message : 'invalid event',
          status : false,
        });
    }
}


exports.getMyEvents = async (req,res)=> {
  let events;
  let {page,perPage,type,route,event_type,date} = req.query;
  perPage = perPage || 10;
  let dateFilter = type?
    { $lt : (date?new Date(date):new Date())}
    :
    {
      date : { $gte : (date?new Date(date):new Date()) } 
    };
    
  let eventTypeFilter = event_type? {event_category : Types.ObjectId(event_type)}: {};
    const searchParam = req.query.search
      ? { name: { $regex: `${req.query.search}`, $options: "i" } }
      : {};
    
  try {
      let aggregation = Event.aggregate();
      let user = await User.findById(req.user.userId).select('_id name').populate('auth','email');
      console.log(user);
      if(route == 'invitedEvents'){
          aggregation
          .match({
            ...eventTypeFilter,
            user : {
              $ne : Types.ObjectId(req.user.userId),
            },
            date : dateFilter,
            ...searchParam,
          })
          .lookup({
              from : 'eventinvitees',
              localField : '_id',
              foreignField : 'eventId',
              as : 'invitees',
              pipeline : [{
                 $match : {
                    email : user.auth.email,
                 }, 
              }],
          })
          .addFields({
            isInvited : {
              $toBool : {$size : '$invitees'},
            }
          })
          .project({
              invitees : 0,            
          })
          .match({
            isInvited : true,
          });
      }else{
        aggregation.match({          
          user : Types.ObjectId(req.user.userId),
          date : dateFilter,
            ...searchParam,
        });
      }
      

      aggregation.lookup({
          from : 'users',
          localField : 'user',
          foreignField : '_id',
          as : 'user',
      })
      .unwind('$user');


      /* 
      ,{
        user : Types.ObjectId(req.user.userId),
        ...searchParam,
        
      },
       */
      var {docs : data,totalPages : total,pagingCounter : from} = await Event.aggregatePaginate(aggregation,{
        page,
        limit: perPage, 
      });
      return res.send({
        data,
        currentPage : page,
        perPage,
        total,
        from
      });
  } catch (error) {
    console.log(error);
      res.code(500).send({
        status : false,
        message : error.toString(),
      });
  }
  
};


exports.getEvent = async (req,res)=>{
  try {
    let event = await Event.findById(req.params.id).populate('event_category invitees media');
    res.send({event});
  } catch (error) {
    res.code(404).send({
      message : error.toString(),
      status : false,
    });
  }
};


exports.updateEvent = async (req,res)=> {
  try {
    var event = await Event.findByIdAndUpdate(req.params.id,{
      ...req.body,
      upload_allowed : req.body.upload_allowed == 'true',
    },{upsert : true}).populate('media');
    const file =
      req.files &&
      req.files.file &&
      req.files.file[0];
    if(file){

      if(event.media)
        delete_file(`uploads/${event.media.path}`);
      
        await File.create({
          userId : req.user.userId,
          name : file.originalname,
          path : file.filename,
          size : file.size,
          mime : file.mimetype,
          fileableType : 'Event',
          fileableId : event._id,
        });
    }

    res.send({
      message : 'event updated successfully',
      status : true,
    })
    
  } catch (error) {
    res.code(500).send({
      message : 'unable to update this event',
      status : false,
    })
  }
};