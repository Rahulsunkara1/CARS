import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please add the User name"],
        },
        email: {
            type: String,
            required: [true, "Please add the Contact email address"],
            unique: [true, "Email address already in DB"],
        },
        password: {
            type: String,
            required: [true, "Please add the user password"],
        }
    },
    {
        collection: "authUsers",
        timestamps: true,
    }
)

const User = mongoose.model('User', userSchema)

export default User