import jwt from "jsonwebtoken";
import User from "../../model/user";
import bcrypt from "bcryptjs";

const login = async (req, res) => {
  const { email, password } = req.body;
  const verifiedEmail = email.toLowerCase();
  try {
    User.findOne({
      email: verifiedEmail,
    }).exec((err, user) => {
      if (err) {
        res.status(400).send({
          type: "error",
          status: 400,
          message: err,
        });
        return;
      }
      if (!user) {
        return res.status(400).send({
          type: "error",
          status: 400,
          message: "User Not Found",
        });
      }

      const passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
        return res.status(400).send({
          type: "error",
          status: 400,
          message: "Invalid Password!",
        });
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        // expiresIn: 86400, //24 hours
      });

      res.status(200).json({
        type: "success",
        status: 200,
        message: "User Successfully Logged-In",
        data: {
          ...user.toObject(),
          token: token,
        },
      });
    });
  } catch (error) {
    return res.status(404).json({
      type: "error",
      status: 404,
      message: error.message,
    });
  }
};

export default login;
