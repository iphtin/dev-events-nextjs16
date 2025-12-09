import { Schema, model, models, Model, Document } from 'mongoose';

// Shape of an Event document
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // Stored as ISO 8601 string
  time: string; // Stored as HH:MM (24h) format
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Simple slug generator to create URL-friendly slugs from titles
const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Normalize time to HH:MM 24-hour format, or return null if invalid
const normalizeTime = (raw: string): string | null => {
  const trimmed = raw.trim();
  const match = /^([0-9]{1,2}):([0-9]{2})$/.exec(trimmed);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm}`;
};

// Ensure a required string field is non-empty after trimming
const nonEmptyStringValidator = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

const EventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Title is required and cannot be empty.',
      },
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Description is required and cannot be empty.',
      },
    },
    overview: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Overview is required and cannot be empty.',
      },
    },
    image: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Image is required and cannot be empty.',
      },
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Venue is required and cannot be empty.',
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Location is required and cannot be empty.',
      },
    },
    date: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Date is required and cannot be empty.',
      },
    },
    time: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Time is required and cannot be empty.',
      },
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Mode is required and cannot be empty.',
      },
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Audience is required and cannot be empty.',
      },
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean => {
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((item) => nonEmptyStringValidator(item))
          );
        },
        message: 'Agenda must be a non-empty array of non-empty strings.',
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyStringValidator,
        message: 'Organizer is required and cannot be empty.',
      },
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean => {
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((item) => nonEmptyStringValidator(item))
          );
        },
        message: 'Tags must be a non-empty array of non-empty strings.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Additional safeguard to enforce unique slug at the database level
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook to handle slug generation and temporal normalization
EventSchema.pre<EventDocument>('save', async function () {
  // Regenerate slug only when the title changes or slug is missing
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title);
  }

  // Normalize date to ISO 8601 string and validate input
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Expected a value parsable by Date.');
    }
    this.date = parsedDate.toISOString();
  }

  // Normalize time to HH:MM 24-hour format
  if (this.isModified('time')) {
    const normalized = normalizeTime(this.time);
    if (!normalized) {
      throw new Error('Invalid time format. Expected HH:MM (24-hour format).');
    }
    this.time = normalized;
  }
});

export const Event: Model<EventDocument> =
  (models.Event as Model<EventDocument> | undefined) || model<EventDocument>('Event', EventSchema);
