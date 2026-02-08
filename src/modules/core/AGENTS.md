# Core Module

## Purpose
Shared data model, types, utilities, constants, and services used across all feature modules.

## Public API
- Types: SeatMap, Seat, Zone, SeatStatus, EditorState, EmbedEvent, HostCommand, ApiResponse
- Utils: coordinates (normalizedToPixel, pixelToNormalized, etc.), validation (validateSeatMap, validateSeat), schema (Zod schemas)
- Constants: ROUTER_URL, SEAT_STATUS_COLORS, ZOOM_LIMITS, CANVAS_DEFAULTS
- Services: apiService, mapsService

## Routes Owned
None (core provides shared infrastructure)

## i18n Key Root
`core`
