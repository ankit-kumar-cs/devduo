import mongoose from "mongoose";

export const connectToDB = async () => {
    console.log('Connecting to the MongoDB Database');
    
    try {
        await mongoose.connect(process.env.DB_ENDPOINT);
        console.log('Database is connected successfully');
        return mongoose;
    } catch (error) {
        console.log('There was an error while connecting to the database', error.message);
        
    }
}
export default mongoose;