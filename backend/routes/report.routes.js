import express from 'express';
import mongoose from 'mongoose';
import { MedicalReport } from '../models/MedicalReport.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/reports
// @desc    Patient uploads a medical report file
router.post('/', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload error' });
    }

    try {
      const { patientName, patientEmail, patientId, fileName, fileType, description } = req.body;

      const detectedExt = req.file
        ? req.file.originalname.split('.').pop().toUpperCase()
        : (fileType || 'PDF').toUpperCase();

      const finalFileName = fileName || (req.file ? req.file.originalname : 'Medical_Report.pdf');

      const report = await MedicalReport.create({
        patientName: patientName || 'Patient',
        patientEmail: patientEmail ? patientEmail.trim().toLowerCase() : '',
        patientId: mongoose.Types.ObjectId.isValid(patientId) ? patientId : undefined,
        fileName: finalFileName,
        fileType: detectedExt,
        uploadDate: new Date().toISOString().split('T')[0],
        description: description || `Uploaded ${detectedExt} medical report.`,
        filePath: req.file ? req.file.path : '',
        fileUrl: req.file ? `/uploads/${req.file.filename}` : ''
      });

      return res.status(201).json({
        message: 'Medical report uploaded successfully',
        report: {
          id: report._id.toString(),
          _id: report._id.toString(),
          patientName: report.patientName,
          fileName: report.fileName,
          fileType: report.fileType,
          uploadDate: report.uploadDate,
          description: report.description,
          fileUrl: report.fileUrl
        }
      });
    } catch (error) {
      console.error('Error saving medical report:', error);
      return res.status(500).json({ message: 'Failed to save medical report' });
    }
  });
});

// @route   GET /api/reports
// @desc    Get all medical reports (with optional patient filter)
router.get('/', async (req, res) => {
  try {
    const { patientId, patientEmail, patientName } = req.query;
    const filter = {};

    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      filter.patientId = patientId;
    }
    if (patientEmail) {
      filter.patientEmail = patientEmail.trim().toLowerCase();
    }
    if (patientName) {
      filter.patientName = new RegExp(patientName, 'i');
    }

    const reports = await MedicalReport.find(filter).sort({ createdAt: -1 }).lean();

    const formatted = reports.map(r => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      patientName: r.patientName,
      patientEmail: r.patientEmail,
      fileName: r.fileName,
      fileType: r.fileType,
      uploadDate: r.uploadDate,
      description: r.description,
      fileUrl: r.fileUrl
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ message: 'Failed to fetch medical reports' });
  }
});

export default router;
