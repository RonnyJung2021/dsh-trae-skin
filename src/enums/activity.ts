/**
 * What the product reports about its own work, as the breathing light reads it.
 *
 * `unknown` is not a third state of the product; it is the skin admitting it
 * cannot see the signal. The band breathes continuously in that case rather than
 * sitting still, because a motionless light reads as "not working".
 */

/** The three readings of the product's streaming signal. */
export const ACTIVITIES = ['idle', 'running', 'unknown'] as const

/** What the product is doing, or that the skin cannot tell. */
export type Activity = typeof ACTIVITIES[number]
