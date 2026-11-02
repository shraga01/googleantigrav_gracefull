import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Streak from './models/Streak.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shraga013:Shraga02%21@cluster0.edggb3n.mongodb.net/daily-appreciation?retryWrites=true&w=majority';
const USER_ID = 'jHWWBAJew2g0JNaTtEJvAvqxhDh2';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const streak = await Streak.findOne({ userId: USER_ID });
        console.log(JSON.stringify(streak, null, 2));
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
