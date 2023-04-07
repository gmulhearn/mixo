import mongoose from "mongoose";

const connectMongoDb = async () => {
    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error("MONGODB_URI must be defined in process env")
    }

    console.log("DEBUG!!!!! CONNECTION MONGO WAS CALLED")

    await mongoose.connect(uri)
}

connectMongoDb().catch((e) => {console.error(e)})

export default connectMongoDb