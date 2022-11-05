/* eslint-disable no-useless-escape */
import jwt from "jsonwebtoken";
import validator from "email-validator";
import User from "../../model/user";
import sendEmail from "../../services/sendEmail";

const register = async (req, res) => {
  try {
    const registerData = req.body;

    if (!registerData.email) {
      throw new Error("Please enter a your email");
    } else {
      if (!validator.validate(registerData.email)) {
        throw new Error("Please enter a valid email");
      } else {
        const user_count = await User.find({ email: registerData.email });
        if (user_count.length != 0) {
          throw new Error("User already exist");
        } else {
          if (user_count.length != 0) {
            throw new Error("This Email is already assiociate with us");
          }
        }
      }
    }

    if (!registerData.phone) {
      throw new Error("Please enter your phone number");
    } else {
      const user_count = await User.find({ phone: registerData.phone });
      if (user_count.length != 0) {
        throw new Error("Phone number already in use");
      }
    }

    const isNonWhiteSpace = /^\S*$/;
    if (!isNonWhiteSpace.test(registerData.password)) {
      throw new Error("Password must not contain Whitespaces.");
    }

    const isContainsUppercase = /^(?=.*[A-Z]).*$/;
    if (!isContainsUppercase.test(registerData.password)) {
      throw new Error("Password must have at least one Uppercase Character.");
    }

    const isContainsLowercase = /^(?=.*[a-z]).*$/;
    if (!isContainsLowercase.test(registerData.password)) {
      throw new Error("Password must have at least one Lowercase Character.");
    }

    const isContainsNumber = /^(?=.*[0-9]).*$/;
    if (!isContainsNumber.test(registerData.password)) {
      throw new Error("Password must contain at least one Digit.");
    }

    const isContainsSymbol =
      /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
    if (!isContainsSymbol.test(registerData.password)) {
      throw new Error("Password must contain at least one Special Symbol.");
    }

    const isValidLength = /^.{6,16}$/;
    if (!isValidLength.test(registerData.password)) {
      throw new Error("Password must be 6-16 Characters Long.");
    }

    if (registerData.password != registerData.confirmPassword) {
      throw new Error("Password and confirm Password dosen't match");
    }

    const base_url = process.env.BASE_URL;
    const file_url = base_url + "/public/" + req.file.filename;

    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      dob: req.body.dob,
      gender: req.body.gender,
      profile_photo: file_url,
    });

    let data = await user.save();

    data = JSON.parse(JSON.stringify(data));

    await sendEmail(
      data.email,
      "Congratulations Account Created Successfully",
      "Congratulations your account is created. Please add your professional info and wait for the admin approval."
    );

    const response = await User.findByIdAndUpdate(data._id, { new: true });

    const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {
      // expiresIn: "1d",
    });

    res.status(200).json({
      status: 200,
      type: "success",
      message: "User Registration Successfully",
      data: {
        ...response.toObject(),
        token: token,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: 400,
      type: "error",
      message: error.message,
    });
  }
};

export default register;
