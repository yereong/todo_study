const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const categoriesFilePath = path.join(__dirname, 'data', 'categories.json');

const readCategories = () => {
  const data = fs.readFileSync(categoriesFilePath, 'utf-8');
  return JSON.parse(data);
};

const writeCategories = (data) => {
  fs.writeFileSync(categoriesFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

app.get('/api/categories', (req, res) => {
  try {
    const categories = readCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  const categories = readCategories();
  const newCategory = {
    id: Date.now(),
    name: req.body.name,
    items: req.body.items || []
  };
  categories.push(newCategory);
  writeCategories(categories);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const categories = readCategories();
  const categoryIndex = categories.findIndex(cat => cat.id === parseInt(req.params.id));
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  categories[categoryIndex].name = req.body.name;
  categories[categoryIndex].items = req.body.items;
  writeCategories(categories);
  res.json(categories[categoryIndex]);
});

app.delete('/api/categories/:id', (req, res) => {
  let categories = readCategories();
  const categoryIndex = categories.findIndex(cat => cat.id === parseInt(req.params.id));
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  categories = categories.filter(cat => cat.id !== parseInt(req.params.id));
  writeCategories(categories);
  res.json({ message: 'Category deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
