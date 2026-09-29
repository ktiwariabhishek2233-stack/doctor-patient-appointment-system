import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
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
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    qualification: {
      type: String,
      default: '',
      trim: true
    },
    experience: {
      type: String,
      default: '',
      trim: true
    },
    about: {
      type: String,
      default: '',
      trim: true
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

// Virtual for slots from AvailableSlot
doctorSchema.virtual('slots', {
  ref: 'AvailableSlot',
  localField: '_id',
  foreignField: 'doctorId'
});

export const Doctor = mongoose.model('Doctor', doctorSchema);
