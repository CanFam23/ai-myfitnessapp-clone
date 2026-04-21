package com.app.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.IntIdTable

object Foods : IntIdTable("foods") {
    val name = varchar("name", 255)
    val caloriesPer100g = double("calories_per_100g")
    val proteinPer100g = double("protein_per_100g")
    val carbsPer100g = double("carbs_per_100g")
    val fatPer100g = double("fat_per_100g")
}

@Serializable
data class Food(
    val id: Int,
    val name: String,
    @SerialName("calories_per_100g") val caloriesPer100g: Double,
    @SerialName("protein_per_100g") val proteinPer100g: Double,
    @SerialName("carbs_per_100g") val carbsPer100g: Double,
    @SerialName("fat_per_100g") val fatPer100g: Double
)
