package com.app.routes

import com.app.models.Foods
import com.app.models.MealEntries
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
private data class MealNutrition(
    val calories: Double,
    val protein: Double,
    val carbs: Double,
    val fat: Double
)

@Serializable
private data class SummaryResponse(
    val date: String,
    @SerialName("total_calories") val totalCalories: Double,
    @SerialName("total_protein") val totalProtein: Double,
    @SerialName("total_carbs") val totalCarbs: Double,
    @SerialName("total_fat") val totalFat: Double,
    @SerialName("by_meal") val byMeal: Map<String, MealNutrition>
)


private val SUMMARY_DATE_REGEX = Regex("""^\d{4}-\d{2}-\d{2}$""")
private val ALL_MEAL_TYPES = listOf("breakfast", "lunch", "dinner", "snack")

fun Application.summaryRoutes() {
    routing {
        get("/api/summary") {
            try {
                val date = call.request.queryParameters["date"]
                if (date.isNullOrBlank() || !SUMMARY_DATE_REGEX.matches(date)) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("date param missing or invalid format"))
                    return@get
                }

                data class NutritionRow(
                    val mealType: String,
                    val calories: Double,
                    val protein: Double,
                    val carbs: Double,
                    val fat: Double
                )

                val rows = transaction {
                    (MealEntries innerJoin Foods)
                        .selectAll()
                        .where { MealEntries.date eq date }
                        .map { row ->
                            val qty = row[MealEntries.quantityGrams]
                            NutritionRow(
                                mealType = row[MealEntries.mealType],
                                calories = row[Foods.caloriesPer100g] * qty / 100,
                                protein = row[Foods.proteinPer100g] * qty / 100,
                                carbs = row[Foods.carbsPer100g] * qty / 100,
                                fat = row[Foods.fatPer100g] * qty / 100
                            )
                        }
                }

                val byMeal = ALL_MEAL_TYPES.associateWith { mealType ->
                    val mealRows = rows.filter { it.mealType == mealType }
                    MealNutrition(
                        calories = mealRows.sumOf { it.calories },
                        protein = mealRows.sumOf { it.protein },
                        carbs = mealRows.sumOf { it.carbs },
                        fat = mealRows.sumOf { it.fat }
                    )
                }

                call.respond(
                    HttpStatusCode.OK,
                    SummaryResponse(
                        date = date,
                        totalCalories = rows.sumOf { it.calories },
                        totalProtein = rows.sumOf { it.protein },
                        totalCarbs = rows.sumOf { it.carbs },
                        totalFat = rows.sumOf { it.fat },
                        byMeal = byMeal
                    )
                )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Unexpected error: ${e.message}"))
            }
        }
    }
}
