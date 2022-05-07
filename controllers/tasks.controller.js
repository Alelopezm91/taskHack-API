const Task = require("../models/Task.model");
const User = require("../models/User.model.js");
const Hired = require("../models/Hired.model");
const Stripe = require("stripe");

module.exports.create = (req, res, next) => {
  const task= ({ user, content } = req.body);
  Task.create(task)
    .then((task) => res.status(200).json(task))
    .catch(next);
};

module.exports.list = (req, res, next) => {
  let criteria = {}
  if (req.params.category) {
    let category = req.params.category;
    category = category.charAt(0).toUpperCase() + category.slice(1);
    criteria.category = category;
  }
    if (req.params.city) {
      let city = req.params.city;
      criteria.city = city;
    }


  Task.find(criteria)
    .populate("user")
    .then((tasks) => {
      if (!tasks) {
        res.status(200).json([]);
      } else {
        res.status(200).json(tasks);
      }
    })
    .catch(next);
};

module.exports.detail = (req, res, next) => {
  Task.findById(req.params.id)
    .then((task) => res.status(200).json(task))
    .catch(next);
};

module.exports.update = (req, res, next) => {
  console.log("hola?", req.params.id);
  Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((task) => {
      console.log(task, req.body);
      res.status(200).json(task);
    })
    .catch(next);
};

module.exports.delete = (req, res, next) => {
  Task.findByIdAndDelete(req.params.id)
    .then((task) => res.status(202).json(task))
    .catch(next);
};

module.exports.checkout = (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);

  const { hiredTaskId, amount, paymentId } = req.body;
  Hired.findOne({ task: req.currentTask, target: hiredTaskId })
    .then((sub) => {
      if (sub) {
        res.status(400).json({ message: "already hired" });
      } else {
        return stripe.paymentIntents
          .create({
            amount: amount * 100,
            currency: "EUR",
            description: "Servicio contratado",
            payment_method: paymentId,
            confirm: true,
          })
          .then((result) => {
            return Hired.create({
              user: req.currentUser,
              targetTask: hiredTaskId,
            }).then((hired) => {
              console.log(hired);
              res.status(201).json({ message: "confirmed!", result });
            });
          });
      }
    })

    .catch(next);
};