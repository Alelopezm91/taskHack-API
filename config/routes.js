const express = require("express");
const router = express.Router();

const upload = require("./storage.config");

const authMiddleware = require("../middlewares/auth.middlewares");

const usersController = require("../controllers/users.controller");
const authController = require("../controllers/auth.controller");

const tasksController= require("../controllers/tasks.controller");


router.get("/", (req, res, next) => {
  res.status(200).json({ ok: true });
});

/* Auth */

router.post("/login", authMiddleware.isNotAuthenticated, authController.login);

/* Users */

router.post("/users", upload.single("image"), authController.create);
router.get("/users", usersController.list);
router.get(
  "/users/me",
  authMiddleware.isAuthenticated,
  usersController.getCurrentUser
);
router.get("/users/:id", usersController.getUserById);
router.post(
  "/users/:userId/checkout",
  authMiddleware.isAuthenticated,
  usersController.checkout
);

/*Tasks*/
router.post("/task/new", tasksController.create);
router.get("/tasks", tasksController.list)
router.get("/task/:id", tasksController.detail);
router.patch("/task/:id", tasksController.update);
router.delete("/task/:id", tasksController.delete);
router.get("/tasks/category/:category", tasksController.list)
router.get("/tasks/:city", tasksController.list);

module.exports = router;
