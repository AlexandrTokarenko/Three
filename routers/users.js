const express = require('express');
const router = express.Router();

// In-memory data store
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
let nextId = 3;

// GET all users with optional filtering, sorting, pagination
router.get('/', (req, res) => {
  let filteredUsers = [...users];

  // Filtering
  if (req.query.name) {
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }

  if (req.query.email) {
    filteredUsers = filteredUsers.filter(user =>
      user.email.toLowerCase().includes(req.query.email.toLowerCase())
    );
  }

  // Sorting
  if (req.query.sort) {
    const [field, order = 'asc'] = req.query.split(':');
    filteredUsers.sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json({
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      totalItems: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit)
    }
  });
});

// GET user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// POST create user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const newUser = {
    id: nextId++,
    name,
    email
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT update user
router.put('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;

  res.json(user);
});

// DELETE user
router.delete('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'User not found' });

  users.splice(index, 1);
  res.json({ message: 'User deleted' });
});

module.exports = router;