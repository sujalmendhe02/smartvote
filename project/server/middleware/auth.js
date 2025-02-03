import jwt from 'jsonwebtoken';

// Middleware for authenticating regular users
const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token

    if (!token) {
      return res.status(403).json({ message: 'Access denied, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    console.log('Decoded Token:', decoded); // Debug log for the decoded token

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role }; // Attach user data to req.user
    if (!req.user.id) {
      return res.status(400).json({ message: 'User ID is missing in token' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('User Authentication Error:', err.message); // Log error details
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware for authenticating admins
const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token

    if (!token) {
      return res.status(403).json({ message: 'Access denied, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    console.log('Decoded Admin Token:', decoded); // Debug log for the decoded token

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }

    req.admin = { id: decoded.id, email: decoded.email, role: decoded.role }; // Attach admin data to req.admin
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Admin Authentication Error:', err.message); // Log error details
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export { authenticateUser, authenticateAdmin };
