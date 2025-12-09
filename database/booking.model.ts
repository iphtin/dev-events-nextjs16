import { Schema, model, models, Model, Document, Types } from 'mongoose';
import { Event } from './event.model';

// Shape of a Booking document
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Basic email format validation regex (not exhaustive, but sufficient for most cases)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // Index to speed up lookups by event
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: 'Email must be a valid email address.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure referential integrity with the Event collection
BookingSchema.pre<BookingDocument>('save', async function () {
  const eventExists = await Event.exists({ _id: this.eventId });

  if (!eventExists) {
    // Throwing inside async middleware will reject the promise and abort the save
    throw new Error('Cannot create booking: referenced event does not exist.');
  }
});

export const Booking: Model<BookingDocument> =
  (models.Booking as Model<BookingDocument> | undefined) ||
  model<BookingDocument>('Booking', BookingSchema);
