import mongoose, { Schema, Document } from 'mongoose'
mongoose.set('strictQuery', true)

interface IRole extends Document {
  role_no: number
  name: string
  description?: string
}

const RoleSchema = new Schema<IRole>({
  role_no: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String },
})

export default mongoose.model<IRole>('role', RoleSchema)
