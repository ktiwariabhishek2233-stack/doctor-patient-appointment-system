import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    age: {
      type: Number,
      default: 30
    },
    gender: {
      type: String,
      default: 'Male'
    },
    address: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: '555-0199'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      }
    }
  }
);

export const Patient = mongoose.model('Patient', patientSchema);
