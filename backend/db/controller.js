const pool = require('./db')
const queries = require('./queries')
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10

async function login(email, password) {
    try {
        const user = await pool.query(queries.getUserByEmail, [email]);
        
        if (!user || user.rows.length === 0) {
            const error = new Error('Auth failed: user not found');
            error.statusCode = 401;
            throw error;
        }
        
        const isSame = await bcrypt.compare(password, user.rows[0].password);
        
        if (!isSame) {
            const error = new Error('Auth failed: invalid password');
            error.statusCode = 401;
            throw error;
        }
        
        console.log('Logged in');
        return user.rows[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(queries.getUsers);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to get users' });
    }
};

const getUserById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
    
        const result = await pool.query(queries.getUserById, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to get user' });
    }
};
  
const addUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
    
        // Check if the username is already taken
        const usernameExists = await pool.query(queries.checkUsernameExists, [username]);
        if (usernameExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username is already taken' });
        }
    
        // Check if the email is already taken
        const emailExists = await pool.query(queries.checkEmailExists, [email]);
        if (emailExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
        // Insert the new user's data
        const result = await pool.query(queries.addUser, [username, hashedPassword, email]);
        if (result.rows.length === 0) {
            return res.status(500).json({ error: 'Failed to add user' });
        }
    
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to add user' });
    }
};
  
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, password, email } = req.body;
    
        // Check if the new username is already taken
        const usernameExists = await pool.query(queries.checkIfUsernameIsTaken, [username, userId]);
        if (usernameExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username is already taken' });
        }
    
        // Check if the new email is already taken
        const emailExists = await pool.query(queries.checkIfEmailIsTaken, [email, userId]);
        if (emailExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
        // Update the user's data
        const result = await pool.query(queries.updateUser, [username, hashedPassword, email, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
};
const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await pool.query(queries.getUserById, [id]);
        if (result.rows.length === 0) {
            return res.send('User does not exist in the database.');
        }
        await pool.query(queries.deleteUser, [id]);
        return res.status(200).send('User removed successfully.');
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
  };

module.exports = {
    login,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
};