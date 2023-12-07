import mongoose, { Schema, Document } from 'mongoose'
mongoose.set('strictQuery', true)

interface IAPIKey extends Document {
  owner: Schema.Types.ObjectId
  name: string
  role: number
  description?: string
}

const APIKeysSchema = new Schema<IAPIKey>({
  owner: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  name: { type: String, required: true },
  role: { type: Number, required: true },
  description: { type: String },
})

export default mongoose.model<IAPIKey>('api-key', APIKeysSchema)
