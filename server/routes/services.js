const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// GET all services (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (featured) {
      query.isFeatured = true;
    }

    const services = await Service.find(query);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET single service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;