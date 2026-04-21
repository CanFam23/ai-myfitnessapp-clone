package com.app

import com.app.models.Foods
import com.app.models.MealEntries
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.time.Instant
import java.time.LocalDate

object DatabaseFactory {
    fun init() {
        File("data").mkdirs()
        Database.connect("jdbc:sqlite:data/app.db", driver = "org.sqlite.JDBC")
        transaction {
            SchemaUtils.createMissingTablesAndColumns(Foods, MealEntries)

            if (Foods.selectAll().count() == 0L) {
                Foods.insert {
                    it[name] = "Chicken Breast"
                    it[caloriesPer100g] = 165.0
                    it[proteinPer100g] = 31.0
                    it[carbsPer100g] = 0.0
                    it[fatPer100g] = 3.6
                }
                Foods.insert {
                    it[name] = "Brown Rice"
                    it[caloriesPer100g] = 112.0
                    it[proteinPer100g] = 2.6
                    it[carbsPer100g] = 23.5
                    it[fatPer100g] = 0.9
                }
                Foods.insert {
                    it[name] = "Banana"
                    it[caloriesPer100g] = 89.0
                    it[proteinPer100g] = 1.1
                    it[carbsPer100g] = 23.0
                    it[fatPer100g] = 0.3
                }
            }

            if (MealEntries.selectAll().count() == 0L) {
                val today = LocalDate.now().toString()
                val now = Instant.now().toString()
                val foodIds = Foods.selectAll().limit(3).map { it[Foods.id].value }
                if (foodIds.size >= 3) {
                    MealEntries.insert {
                        it[foodId] = EntityID(foodIds[0], Foods)
                        it[mealType] = "breakfast"
                        it[quantityGrams] = 150.0
                        it[date] = today
                        it[createdAt] = now
                    }
                    MealEntries.insert {
                        it[foodId] = EntityID(foodIds[1], Foods)
                        it[mealType] = "lunch"
                        it[quantityGrams] = 200.0
                        it[date] = today
                        it[createdAt] = now
                    }
                    MealEntries.insert {
                        it[foodId] = EntityID(foodIds[2], Foods)
                        it[mealType] = "snack"
                        it[quantityGrams] = 120.0
                        it[date] = today
                        it[createdAt] = now
                    }
                }
            }
        }
    }
}
