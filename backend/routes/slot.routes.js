import express from 'express';
import mongoose from 'mongoose';
import { AvailableSlot } from '../models/AvailableSlot.js';

const router = express.Router();

// @route   DELETE /api/slots/:id
// @desc    Doctor deletes an available slot; block if booked
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid slot ID' });
    }

    const slot = await AvailableSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status === 'Booked') {
      return res.status(400).json({ message: 'Cannot delete a booked slot' });
    }

    await AvailableSlot.findByIdAndDelete(id);

    return res.json({ message: 'Slot deleted successfully', id });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return res.status(500).json({ message: 'Failed to delete slot' });
  }
});

export default router;
