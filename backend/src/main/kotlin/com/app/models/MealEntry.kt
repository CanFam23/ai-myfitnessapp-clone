package com.app.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.IntIdTable

object MealEntries : IntIdTable("meal_entries") {
    val foodId = reference("food_id", Foods)
    val mealType = varchar("meal_type", 20)
    val quantityGrams = double("quantity_grams")
    val date = varchar("date", 10)
    val createdAt = varchar("created_at", 50)
}

@Serializable
data class MealEntry(
    val id: Int,
    @SerialName("food_id") val foodId: Int,
    @SerialName("meal_type") val mealType: String,
    @SerialName("quantity_grams") val quantityGrams: Double,
    val date: String,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class EntryWithNutrition(
    val id: Int,
    @SerialName("meal_type") val mealType: String,
    @SerialName("quantity_grams") val quantityGrams: Double,
    @SerialName("food_id") val foodId: Int,
    @SerialName("food_name") val foodName: String,
    val calories: Double,
    val protein: Double,
    val carbs: Double,
    val fat: Double,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class CreateMealEntry(
    @SerialName("food_id") val foodId: Int,
    @SerialName("meal_type") val mealType: String,
    @SerialName("quantity_grams") val quantityGrams: Double,
    val date: String
)

@Serializable
data class UpdateMealEntry(
    @SerialName("quantity_grams") val quantityGrams: Double
)
