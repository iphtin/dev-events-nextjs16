// lib/mongodb.ts
import mongoose, { ConnectOptions, Mongoose } from "mongoose";

/**
 * Type for the cached connection stored on `globalThis` during development.
 * We attach our cache to `globalThis` to survive module reloads (Next.js dev).
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

/**
 * MongoDB connection string must be provided via environment variable.
 * Example: export MONGODB_URI="mongodb+srv://user:pass@cluster.example.mongodb.net/mydb"
 */
const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Re-use existing cached connection across module reloads in development.
 * In production this will be undefined and we create a fresh cache object.
 */
const cached = globalThis._mongooseCache ?? { conn: null, promise: null };

/**
 * Establish (or reuse) a Mongoose connection.
 * - Returns the Mongoose object so callers can use `mongoose.model()` or `mongoose.connection`.
 * - Caches the connection/promise to prevent multiple connections in dev/hot-reload.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, await it
  if (!cached.promise) {
    const opts: ConnectOptions = {
      // Keep options minimal — Mongoose 6+ has sensible defaults.
      // Add options here if you need to customize (e.g., dbName).
    };

    // Create and store the promise for concurrent callers to await
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => {
      return mongoose;
    });
  }

  // Await (or create) the connection and store it on the cache
  cached.conn = await cached.promise;
  globalThis._mongooseCache = cached;

  return cached.conn;
}

/**
 * Optional default export — some codebases prefer default import.
 * Named export is primary.
 */
export default connectToDatabase;