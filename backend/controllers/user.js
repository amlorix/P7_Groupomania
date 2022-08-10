const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const dotenv = require("dotenv");
dotenv.config();
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const BCRYPT_CYCLE = process.env.BCRYPT_CYCLE;

const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;

exports.signup = (req, res, next) => {
  const emailUserInput = req.body.email;
  // regex email
  if (!emailRegex.test(emailUserInput)) {
    return res
      .status(401)
      .json({ message: "Paire identifiant/mot de passe incorrecte" });
  }
  bcrypt
    .hash(req.body.password, parseInt(BCRYPT_CYCLE)) // encrypting the password
    .then((hash) => {
      const user = new User({
        name: req.body.name,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => {
          res.status(201).json({ message: "Utilisateur crée !" });
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({ message: "Paire identifiant/mot de passe incorrecte" });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, AUTH_TOKEN, {
                  expiresIn: "24h",
                }),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
