package com.app.routes

import com.app.models.CreateTripRequest
import com.app.models.ErrorResponse
import com.app.models.Trip
import com.app.models.Trips
import com.app.models.toTrip
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.time.Instant
import java.time.LocalDate

private val allowedStatuses = setOf("planned", "in-progress", "completed")

fun Application.tripRoutes() {
    routing {
        route("/api/trips") {
            get {
                try {
                    val status = call.request.queryParameters["status"]?.trim()

                    if (!status.isNullOrBlank() && status !in allowedStatuses) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("status must be planned, in-progress, or completed"))
                        return@get
                    }

                    val trips = transaction {
                        val query = if (status.isNullOrBlank()) {
                            Trips.selectAll()
                        } else {
                            Trips.select(Trips.status eq status)
                        }

                        query.orderBy(Trips.startDate to SortOrder.ASC).map { row -> row.toTrip() }
                    }

                    call.respond(HttpStatusCode.OK, trips)
                } catch (exception: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected server error"))
                }
            }

            get("/upcoming") {
                try {
                    val today = LocalDate.now()
                    val trips = transaction {
                        Trips.select(Trips.status eq "planned")
                            .map { row -> row.toTrip() }
                            .filter { trip ->
                                LocalDate.parse(trip.startDate) >= today
                            }
                    }

                    call.respond(HttpStatusCode.OK, trips)
                } catch (exception: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected server error"))
                }
            }

            get("/{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                    if (id == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("id must be a valid integer"))
                        return@get
                    }

                    val trip = transaction {
                        Trips.select(Trips.id eq id).singleOrNull()?.toTrip()
                    }

                    if (trip == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Trip not found"))
                        return@get
                    }

                    call.respond(HttpStatusCode.OK, trip)
                } catch (exception: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected server error"))
                }
            }

            post {
                try {
                    val body = call.receive<CreateTripRequest>()
                    val validationError = validateTripBody(body, requireStatus = false)

                    if (validationError != null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse(validationError))
                        return@post
                    }

                    val status = body.status?.trim().takeUnless { it.isNullOrBlank() } ?: "planned"
                    val now = Instant.now().toString()
                    val normalizedStops = body.stops.map { it.trim() }.filter { it.isNotBlank() }

                    val created = transaction {
                        val stmt = Trips.insert {
                            it[title] = body.title.trim()
                            it[origin] = body.origin.trim()
                            it[destination] = body.destination.trim()
                            it[startDate] = body.startDate
                            it[endDate] = body.endDate
                            it[stopsJson] = Json.encodeToString(normalizedStops)
                            it[budgetUsd] = body.budgetUsd
                            it[Trips.status] = status
                            it[notes] = body.notes.trim()
                            it[createdAt] = now
                            it[updatedAt] = now
                        }

                        Trip(
                            id = stmt[Trips.id].value,
                            title = body.title.trim(),
                            origin = body.origin.trim(),
                            destination = body.destination.trim(),
                            startDate = body.startDate,
                            endDate = body.endDate,
                            stops = normalizedStops,
                            budgetUsd = body.budgetUsd,
                            status = status,
                            notes = body.notes.trim(),
                            createdAt = now,
                            updatedAt = now
                        )
                    }

                    call.respond(HttpStatusCode.Created, created)
                } catch (exception: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected server error"))
                }
            }

            put("/{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                    if (id == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("id must be a valid integer"))
                        return@put
                    }

                    val body = call.receive<CreateTripRequest>()
                    val validationError = validateTripBody(body, requireStatus = true)

                    if (validationError != null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse(validationError))
                        return@put
                    }

                    val status = body.status!!.trim()
                    val now = Instant.now().toString()
                    val normalizedStops = body.stops.map { it.trim() }.filter { it.isNotBlank() }

                    val updated = transaction {
                        val existing = Trips.select(Trips.id eq id).singleOrNull()
                        if (existing == null) {
                            null
                        } else {
                            Trips.update({ Trips.id eq id }) {
                                it[title] = body.title.trim()
                                it[origin] = body.origin.trim()
                                it[destination] = body.destination.trim()
                                it[startDate] = body.startDate
                                it[endDate] = body.endDate
                                it[stopsJson] = Json.encodeToString(normalizedStops)
                                it[budgetUsd] = body.budgetUsd
                                it[Trips.status] = status
                                it[notes] = body.notes.trim()
                                it[updatedAt] = now
                            }

                            Trips.select(Trips.id eq id).single().toTrip()
                        }
                    }

                    if (updated == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Trip not found"))
                        return@put
                    }

                    call.respond(HttpStatusCode.OK, updated)
                } catch (exception: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected server error"))
                }
            }

            delete("/{id}") {
                try {
                    val id = call.parameters["id"]?.toIntOrNull()
                    if (id == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("id must be a valid integer"))
                        return@delete
                    }

                    val deletedCount = transaction {
                        Trips.deleteWhere { Trips.id eq id }
                    }

                    if (deletedCount == 0) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Trip not found"))
                        return@delete
                    }

                    call.respond(HttpStatusCode.NoContent, "")
                } catch (exception: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected server error"))
                }
            }
        }
    }
}

private fun validateTripBody(body: CreateTripRequest, requireStatus: Boolean): String? {
    if (body.title.isBlank()) return "title is required"
    if (body.origin.isBlank()) return "origin is required"
    if (body.destination.isBlank()) return "destination is required"
    if (body.budgetUsd < 0.0) return "budgetUsd must be greater than or equal to 0"

    val startDate = runCatching { LocalDate.parse(body.startDate) }.getOrNull()
        ?: return "startDate must be a valid ISO date"
    val endDate = runCatching { LocalDate.parse(body.endDate) }.getOrNull()
        ?: return "endDate must be a valid ISO date"

    if (endDate.isBefore(startDate)) {
        return "endDate must be greater than or equal to startDate"
    }

    if (requireStatus && body.status == null) {
        return "status is required"
    }

    if (body.status != null) {
        val normalizedStatus = body.status.trim()
        if (normalizedStatus !in allowedStatuses) {
            return "status must be planned, in-progress, or completed"
        }
    }

    return null
}
