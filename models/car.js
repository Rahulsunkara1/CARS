import mongoose from 'mongoose'

const carSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        carname: {
            type: String,
            required: [true, "Please add the Car name"],
        },
        price: {
            type: Number,
            required: [true, "Please add the Car Price"],
        },
        year: {
            type: Number,
            required: [true, "Please add the Car year"],
        },
        model: {
            type: String,
            required: [true, "Please add the Car model"],
        },
        make: {
            type: String,
            required: [true, "Please add the Car Make"],
        },
        filename: {
            type: String,
        },
        base64: {
            type: String,
        }
    },
    {
        collection: "cars",
        timestamps: true
    }
)

const Car = mongoose.model('Car', carSchema)

export default Car