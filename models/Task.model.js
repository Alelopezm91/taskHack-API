const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    city: {
      type: String,
      enum: ["Madrid", "Barcelona", "Valencia"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Gardening",
        "Moving",
        "Mounting",
        "Cleaning",
        "Delivery",
        "Cooking",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

taskSchema.virtual("hired", {
  ref: "Hired",
  localField: "_id",
  foreignField: "task",
  justOne: false,
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
