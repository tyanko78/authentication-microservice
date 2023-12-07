import mongoose, { Schema, Document } from 'mongoose'
import { NextFunction } from 'express'
import bcrypt from 'bcrypt'
mongoose.set('strictQuery', true)

interface IUser extends Document {
  username: string
  email?: string
  password: string
  name?: string
  role?: number
  status?: number
  tenant: Schema.Types.ObjectId
  additionalFields?: Record<string, unknown>
  deleted_at?: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: false },
    password: { type: String, required: true },
    name: { type: String, default: '' },
    role: { type: Number, default: 0 },
    status: { type: Number, enum: [1, 0], default: 1 },
    tenant: { type: mongoose.Types.ObjectId, ref: 'tenant', default: null },
    additionalFields: { type: Object, default: {} },
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
)

UserSchema.pre('save', async function (next: NextFunction) {
  const user = this

  if (!user.isNew && !user.isModified('password')) return next()

  bcrypt.genSalt(10, (saltError: Error, salt: string) => {
    if (saltError) return next(saltError)

    bcrypt.hash(user.password, salt, (hashError: Error, hash: string) => {
      if (hashError) return next(hashError)

      user.password = hash
      next()
    })
  })
})

export default mongoose.model<IUser>('users', UserSchema)
