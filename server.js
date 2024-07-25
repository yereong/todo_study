const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // 클라이언트의 포트에 맞게 수정

// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/todoApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const categorySchema = new mongoose.Schema({
    date: Date,
    name: String,
    items: [{ _id: mongoose.Schema.Types.ObjectId, text: String, checked: Boolean }] // _id 추가
  });
  
const Category = mongoose.model('Category', categorySchema);

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Routes
// Get categories by date
app.get('/api/categories/:date', async (req, res) => {
  const dateString = req.params.date;
  const startDate = new Date(dateString);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  try {
    const categories = await Category.find({
      date: { $gte: startDate, $lt: endDate }
    });
    console.log('Fetched categories:', categories); // 로그 추가
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add new category
app.post('/api/categories', async (req, res) => {
  const newCategory = req.body;
  try {
    const createdCategory = await Category.create(newCategory);
    console.log('Created category:', createdCategory); // 로그 추가
    res.json(createdCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Add item to category
app.post('/api/categories/items', async (req, res) => {
  const { categoryId, newItem } = req.body;
  if (!isValidObjectId(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $push: { items: newItem } },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.log('Item added:', newItem); // 로그 추가
    res.json(newItem);
  } catch (error) {
    console.error('Error adding item to category:', error);
    res.status(500).json({ error: 'Failed to add item to category' });
  }
});

// Update category name
app.patch('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.log('Updated category name:', updatedCategory); // 로그 추가
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category name:', error);
    res.status(500).json({ error: 'Failed to update category name' });
  }
});

app.patch('/api/categories/items/:categoryId/:itemId', async (req, res) => {
    const { categoryId, itemId } = req.params;
    const { text, checked } = req.body;
  
    if (!isValidObjectId(categoryId) || !isValidObjectId(itemId)) {
      return res.status(400).json({ error: 'Invalid category or item ID' });
    }
  
    try {
      const updatedCategory = await Category.findOneAndUpdate(
        { _id: categoryId, 'items._id': itemId },
        {
          $set: {
            'items.$.text': text,
            'items.$.checked': checked
          }
        },
        { new: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Item not found for update' });
      }
  
      res.json({ text, checked });
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  });
  
  
  
app.delete('/api/categories/:id', async (req, res) => {
    console.log('DELETE request received for category ID:', req.params.id); // 로그 추가
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    try {
      const deletedCategory = await Category.findByIdAndDelete(id);
      if (!deletedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
      console.log('Deleted category:', deletedCategory); // 로그 추가
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });
  
  

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});