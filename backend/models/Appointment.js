import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    patientAge: {
      type: Number,
      default: 30
    },
    patientGender: {
      type: String,
      default: 'Female'
    },
    patientAddress: {
      type: String,
      default: ''
    },
    patientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING'
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

export const Appointment = mongoose.model('Appointment', appointmentSchema);
