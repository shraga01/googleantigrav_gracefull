// Quick script to check MongoDB data for a user
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shraga013:Shraga02%21@cluster0.edggb3n.mongodb.net/daily-appreciation?retryWrites=true&w=majority';

async function checkUserData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('\n=== ALL USERS ===');
        console.log(JSON.stringify(users, null, 2));

        // Get all entries
        const entries = await mongoose.connection.db.collection('entries').find({}).toArray();
        console.log('\n=== ALL ENTRIES ===');
        console.log(JSON.stringify(entries, null, 2));

        // Get all streaks
        const streaks = await mongoose.connection.db.collection('streaks').find({}).toArray();
        console.log('\n=== ALL STREAKS ===');
        console.log(JSON.stringify(streaks, null, 2));

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUserData();
