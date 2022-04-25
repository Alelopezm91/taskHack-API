const createError = require("http-errors");
const User = require("../models/User.model.js");
const Hired= require("../models/Hired.model")
const Stripe=require("stripe")
require("../models/Task.model")

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.id).populate('tasks')
    .then((user) => {
      if (!user) {
        // not found
        next(createError(404, "User not found"));
      } else {
        res.status(200).json(user);
      }
    })
    .catch(next);
};


module.exports.list = (req, res, next) => {
  User.find()
    .populate("tasks")
    .then((users) => {
      if (!users) {
        res.status(200).json([]);
      } else {
        res.status(200).json(users);
      }
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.currentUser).populate('tasks')
    .then((user) => {
      if (!user) {
        // not found
        next(createError(404, "User not found"));
      } else {
        res.status(200).json(user);
      }
    })
    .catch(next);
};

module.exports.checkout = (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);

  const { hiredUserId, amount, paymentId } = req.body;
  Hired.findOne({ user: req.currentUser, targetUser: hiredUserId })
    .then((sub) => {
      if (sub) {
        res.status(400).json({ message: "already hired" });
      } else {
        return stripe.paymentIntents
          .create({
            amount,
            currency: "USD",
            description: "Servicio contratado",
            payment_method: paymentId,
            confirm: true,
          })
          .then((result) => {
            return Hired.create({
              user: req.currentUser,
              targetUser: hiredUserId,
            }).then((hired) => {
              console.log(hired);
              res.status(201).json({ message: "confirmed!", result });
            });
          });
      }
    })

    .catch(next);
};