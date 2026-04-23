package com.app.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ResultRow

object Trips : IntIdTable("trips") {
    val title = varchar("title", 255)
    val origin = varchar("origin", 255)
    val destination = varchar("destination", 255)
    val startDate = varchar("start_date", 32)
    val endDate = varchar("end_date", 32)
    val stopsJson = text("stops_json").default("[]")
    val budgetUsd = double("budget_usd").default(0.0)
    val status = varchar("status", 32).default("planned")
    val notes = text("notes").default("")
    val createdAt = varchar("created_at", 64)
    val updatedAt = varchar("updated_at", 64)
}

@Serializable
data class Trip(
    val id: Int,
    val title: String,
    val origin: String,
    val destination: String,
    val startDate: String,
    val endDate: String,
    val stops: List<String>,
    val budgetUsd: Double,
    val status: String,
    val notes: String,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class CreateTripRequest(
    val title: String,
    val origin: String,
    val destination: String,
    val startDate: String,
    val endDate: String,
    val stops: List<String> = emptyList(),
    val budgetUsd: Double,
    val status: String? = null,
    val notes: String = ""
)

@Serializable
data class ErrorResponse(
    val error: String
)

fun ResultRow.toTrip(): Trip {
    val decodedStops = runCatching {
        Json.decodeFromString<List<String>>(this[Trips.stopsJson])
    }.getOrDefault(emptyList())

    return Trip(
        id = this[Trips.id].value,
        title = this[Trips.title],
        origin = this[Trips.origin],
        destination = this[Trips.destination],
        startDate = this[Trips.startDate],
        endDate = this[Trips.endDate],
        stops = decodedStops,
        budgetUsd = this[Trips.budgetUsd],
        status = this[Trips.status],
        notes = this[Trips.notes],
        createdAt = this[Trips.createdAt],
        updatedAt = this[Trips.updatedAt]
    )
}
