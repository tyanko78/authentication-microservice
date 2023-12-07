import mongoose, { Schema, Document } from 'mongoose'
mongoose.set('strictQuery', true)

interface ITenant extends Document {
  name: string
  status: number
}

const TenantSchema = new Schema<ITenant>({
  name: { type: String, unique: true, required: true },
  status: { type: Number, enum: [1, 0], default: 1 },
})

export default mongoose.model<ITenant>('tenant', TenantSchema)
