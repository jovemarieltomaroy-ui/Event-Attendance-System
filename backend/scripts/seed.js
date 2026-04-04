/* ADMIN SETUP SCRIPT
 * This is where I created the initial admin account. 
 * This is necessary because there is no sign up available, only one account for the organization.
 */



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); 


const MONGO_URI = 'mongodb://localhost:27017/AttendanceSystem'; 

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB...");

     
        const existingUser = await User.findOne({ username: 'midsa313' });
        if (existingUser) {
            console.log("Admin user already exists. Deleting and recreating...");
            await User.deleteOne({ username: 'midsa313' });
        }

        
        const plainPassword = 'mids@1998'; 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        
        await User.create({
            username: 'midsa313',
            password: hashedPassword
        });

        console.log("Successfully created encrypted admin account!");
        console.log("Username: midsa313");
        console.log("Password: mids@1998");
        process.exit();
    })
    .catch(err => console.error(err));