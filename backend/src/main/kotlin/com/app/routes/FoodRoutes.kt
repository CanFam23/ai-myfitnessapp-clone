package com.app.routes

import com.app.models.Food
import com.app.models.Foods
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
private data class FoodsListResponse(val items: List<Food>)


fun Application.foodRoutes() {
    routing {
        get("/api/foods") {
            try {
                val q = call.request.queryParameters["q"]
                if (q.isNullOrBlank()) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("q param missing or empty"))
                    return@get
                }
                val foods = transaction {
                    Foods.selectAll().where { Foods.name like "%$q%" }.map { row ->
                        Food(
                            id = row[Foods.id].value,
                            name = row[Foods.name],
                            caloriesPer100g = row[Foods.caloriesPer100g],
                            proteinPer100g = row[Foods.proteinPer100g],
                            carbsPer100g = row[Foods.carbsPer100g],
                            fatPer100g = row[Foods.fatPer100g]
                        )
                    }
                }
                call.respond(HttpStatusCode.OK, FoodsListResponse(items = foods))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
            }
        }

        get("/api/foods/{id}") {
            try {
                val id = call.parameters["id"]?.toIntOrNull()
                if (id == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid id"))
                    return@get
                }
                val food = transaction {
                    Foods.selectAll().where { Foods.id eq id }.singleOrNull()?.let { row ->
                        Food(
                            id = row[Foods.id].value,
                            name = row[Foods.name],
                            caloriesPer100g = row[Foods.caloriesPer100g],
                            proteinPer100g = row[Foods.proteinPer100g],
                            carbsPer100g = row[Foods.carbsPer100g],
                            fatPer100g = row[Foods.fatPer100g]
                        )
                    }
                }
                if (food == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("food not found"))
                } else {
                    call.respond(HttpStatusCode.OK, food)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
            }
        }
    }
}
