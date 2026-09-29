import mongoose from 'mongoose';

const availableSlotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    date: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Available', 'Booked'],
      default: 'Available'
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

export const AvailableSlot = mongoose.model('AvailableSlot', availableSlotSchema);
