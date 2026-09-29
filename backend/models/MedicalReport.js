import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    patientEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    fileType: {
      type: String,
      enum: ['PDF', 'JPG', 'JPEG', 'PNG'],
      default: 'PDF'
    },
    uploadDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    description: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      default: ''
    },
    fileUrl: {
      type: String,
      default: ''
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

export const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
