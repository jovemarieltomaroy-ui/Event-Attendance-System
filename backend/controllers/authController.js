const User = require('../models/user');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        res.json({ message: 'Login successful', username: user.username });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login };