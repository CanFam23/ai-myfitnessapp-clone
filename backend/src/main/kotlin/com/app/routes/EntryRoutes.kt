package com.app.routes

import com.app.models.CreateMealEntry
import com.app.models.EntryWithNutrition
import com.app.models.Foods
import com.app.models.MealEntries
import com.app.models.MealEntry
import com.app.models.UpdateMealEntry
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.time.Instant

@Serializable
private data class EntriesListResponse(val date: String, val entries: List<EntryWithNutrition>)


private val DATE_REGEX = Regex("""^\d{4}-\d{2}-\d{2}$""")
private val VALID_MEAL_TYPES = setOf("breakfast", "lunch", "dinner", "snack")

fun Application.entryRoutes() {
    routing {
        get("/api/entries") {
            try {
                val date = call.request.queryParameters["date"]
                if (date.isNullOrBlank() || !DATE_REGEX.matches(date)) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("date param missing or invalid format"))
                    return@get
                }
                val entries = transaction {
                    (MealEntries innerJoin Foods)
                        .selectAll()
                        .where { MealEntries.date eq date }
                        .map { row ->
                            val qty = row[MealEntries.quantityGrams]
                            EntryWithNutrition(
                                id = row[MealEntries.id].value,
                                mealType = row[MealEntries.mealType],
                                quantityGrams = qty,
                                foodId = row[MealEntries.foodId].value,
                                foodName = row[Foods.name],
                                calories = row[Foods.caloriesPer100g] * qty / 100,
                                protein = row[Foods.proteinPer100g] * qty / 100,
                                carbs = row[Foods.carbsPer100g] * qty / 100,
                                fat = row[Foods.fatPer100g] * qty / 100,
                                createdAt = row[MealEntries.createdAt]
                            )
                        }
                }
                call.respond(HttpStatusCode.OK, EntriesListResponse(date = date, entries = entries))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
            }
        }

        post("/api/entries") {
            try {
                val body = call.receive<CreateMealEntry>()
                if (body.mealType !in VALID_MEAL_TYPES) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("invalid meal_type"))
                    return@post
                }
                if (body.quantityGrams <= 0) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("quantity_grams must be > 0"))
                    return@post
                }
                if (!DATE_REGEX.matches(body.date)) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("invalid date format"))
                    return@post
                }
                val now = Instant.now().toString()
                val created = transaction {
                    val foodExists = Foods.selectAll().where { Foods.id eq body.foodId }.count() > 0
                    if (!foodExists) return@transaction null
                    val stmt = MealEntries.insert {
                        it[foodId] = EntityID(body.foodId, Foods)
                        it[mealType] = body.mealType
                        it[quantityGrams] = body.quantityGrams
                        it[date] = body.date
                        it[createdAt] = now
                    }
                    MealEntry(
                        id = stmt[MealEntries.id].value,
                        foodId = body.foodId,
                        mealType = body.mealType,
                        quantityGrams = body.quantityGrams,
                        date = body.date,
                        createdAt = now
                    )
                }
                if (created == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("food_id does not exist"))
                } else {
                    call.respond(HttpStatusCode.OK, created)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
            }
        }

        put("/api/entries/{id}") {
            try {
                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid id"))
                    return@put
                }
                val body = call.receive<UpdateMealEntry>()
                if (body.quantityGrams <= 0) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("quantity_grams must be > 0"))
                    return@put
                }
                val updated = transaction {
                    val existing = MealEntries.selectAll().where { MealEntries.id eq id }.singleOrNull()
                        ?: return@transaction null
                    MealEntries.update({ MealEntries.id eq id }) {
                        it[quantityGrams] = body.quantityGrams
                    }
                    MealEntry(
                        id = id,
                        foodId = existing[MealEntries.foodId].value,
                        mealType = existing[MealEntries.mealType],
                        quantityGrams = body.quantityGrams,
                        date = existing[MealEntries.date],
                        createdAt = existing[MealEntries.createdAt]
                    )
                }
                if (updated == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("entry not found"))
                } else {
                    call.respond(HttpStatusCode.OK, updated)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
            }
        }

        delete("/api/entries/{id}") {
            try {
                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid id"))
                    return@delete
                }
                val deleted = transaction {
                    val exists = MealEntries.selectAll().where { MealEntries.id eq id }.count() > 0
                    if (!exists) return@transaction false
                    MealEntries.deleteWhere { MealEntries.id eq id }
                    true
                }
                if (!deleted) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("entry not found"))
                } else {
                    call.respond(HttpStatusCode.NoContent)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
            }
        }
    }
}
