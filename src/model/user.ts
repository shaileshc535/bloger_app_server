/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export interface IUser {
  email: string;
  profile_photo: string;
  password: string;
  firstname: string;
  lastname: string;
  fullname: string;
  gender: GenderEnum;
  dob: string;
  phone?: number;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Email is not a valid Email",
      },
      required: true,
    },

    profile_photo: { type: String },

    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!.%*?&])[A-Za-z\d@$!.%*?&]{6,}$/.test(
            value
          );
        },
        message: "{VALUE} is not a valid password",
      },
    },

    firstname: { type: String, required: true, minlength: 2, maxlength: 50 },

    lastname: { type: String, required: true, minlength: 2, maxlength: 50 },

    fullname: { type: String },

    gender: { type: String, enum: GenderEnum },

    dob: {
      type: String,
      validate: {
        validator: (value) => {
          return validator.isDate(value, {
            format: "YYYY/MM/DD",
          });
        },
        message: "{VALUE} is not a valid date",
      },
    },

    phone: { type: Number },
  },
  {
    timestamps: true,
  }
);

userSchema
  .virtual("name")
  .get(function (this: mongoose.HydratedDocument<IUser>) {
    return `${this.firstname} ${this.lastname}`;
  });

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.pre("save", function (this: mongoose.HydratedDocument<IUser>, next) {
  const user = this;
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });

  user.email = user.email.toLowerCase();

  user.fullname = user.firstname + " " + user.lastname;
});

userSchema.methods.toJSON = function (this: mongoose.HydratedDocument<IUser>) {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.methods.comparePassword = function (
  this: mongoose.HydratedDocument<IUser>,
  password
) {
  const user = this;

  return bcrypt.compareSync(password, user.password);
};

const User = mongoose.model("user", userSchema);
export default User;
