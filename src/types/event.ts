// Shared contract with aforo-backend (see ARCHITECTURE.md, section 4).
// Keep in sync with the backend; do not add fields here that the API does not return.

export type Direction = 'ENTRY' | 'EXIT'
export type EventMethod = 'FACE' | 'BODY_ONLY'
export type CameraId = 'camera-outside' | 'camera-inside'

export interface AforoEvent {
  eventId: string
  personId: string | null
  personName: string | null
  direction: Direction
  cameraOutsideId: CameraId
  cameraInsideId: CameraId
  confidence: number
  method: EventMethod
  /** ISO 8601 */
  timestamp: string
}

export interface PersonStatus {
  personId: string
  name: string
  status: 'IN' | 'OUT'
  lastEventAt: string
}

/** Response of `GET /aforo`. */
export interface AforoStatus {
  currentOccupancy: number
  /** ISO 8601 */
  lastUpdated: string
}
