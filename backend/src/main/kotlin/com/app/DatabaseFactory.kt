package com.app

import com.app.models.Trips
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.time.Instant

object DatabaseFactory {
    fun init() {
        val dataDirectory = File("data")
        if (!dataDirectory.exists()) {
            dataDirectory.mkdirs()
        }

        val dbFile = File(dataDirectory, "app.db")
        Database.connect(url = "jdbc:sqlite:${dbFile.path}", driver = "org.sqlite.JDBC")

        transaction {
            SchemaUtils.createMissingTablesAndColumns(Trips)
            seedTripsIfEmpty()
        }
    }

    private fun seedTripsIfEmpty() {
        if (Trips.selectAll().count() > 0L) {
            return
        }

        val now = Instant.now().toString()

        Trips.insert {
            it[title] = "Southwest Scenic Loop"
            it[origin] = "Denver, CO"
            it[destination] = "Moab, UT"
            it[startDate] = "2026-06-10"
            it[endDate] = "2026-06-16"
            it[stopsJson] = Json.encodeToString(listOf("Grand Junction", "Arches National Park"))
            it[budgetUsd] = 1200.0
            it[status] = "planned"
            it[notes] = "Book campsite near Moab."
            it[createdAt] = now
            it[updatedAt] = now
        }

        Trips.insert {
            it[title] = "Pacific Coast Weekend"
            it[origin] = "San Francisco, CA"
            it[destination] = "Big Sur, CA"
            it[startDate] = "2026-05-01"
            it[endDate] = "2026-05-03"
            it[stopsJson] = Json.encodeToString(listOf("Half Moon Bay", "Monterey"))
            it[budgetUsd] = 650.0
            it[status] = "in-progress"
            it[notes] = "Reserve dinner in Carmel."
            it[createdAt] = now
            it[updatedAt] = now
        }

        Trips.insert {
            it[title] = "Blue Ridge Fall Drive"
            it[origin] = "Asheville, NC"
            it[destination] = "Roanoke, VA"
            it[startDate] = "2025-10-12"
            it[endDate] = "2025-10-15"
            it[stopsJson] = Json.encodeToString(listOf("Blowing Rock", "Mabry Mill"))
            it[budgetUsd] = 900.0
            it[status] = "completed"
            it[notes] = "Great leaf colors near Milepost 176."
            it[createdAt] = now
            it[updatedAt] = now
        }
    }
}
