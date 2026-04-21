
```kotlin
// FILE: backend/settings.gradle.kts
rootProject.name = "app"
```

Configures the root project name as "app".

```kotlin
// FILE: backend/build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.serialization") version "1.9.25"
    application
}

group = "com.app"
version = "1.0.0"

application {
    mainClass.set("com.app.ApplicationKt")
}

repositories {
    mavenCentral()
}

val ktorVersion = "2.3.12"
val exposedVersion = "0.55.0"

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.xerial:sqlite-jdbc:3.47.1.0")
    implementation("ch.qos.logback:logback-classic:1.5.12")
}

kotlin {
    jvmToolchain(21)
}
```

Configures all build dependencies, plugins, and JVM toolchain 21 for the backend.

```properties
# FILE: backend/gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

Pins the Gradle wrapper to version 8.10.

```kotlin
// FILE: backend/src/main/kotlin/com/app/Application.kt
package com.app

import com.app.routes.entryRoutes
import com.app.routes.foodRoutes
import com.app.routes.summaryRoutes
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import kotlinx.serialization.json.Json

fun main() {
    DatabaseFactory.init()
    embeddedServer(Netty, port = 3001) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                ignoreUnknownKeys = true
            })
        }
        install(CORS) {
            allowHost("localhost:5173")
            allowHeader(HttpHeaders.ContentType)
            allowMethod(HttpMethod.Get)
            allowMethod(HttpMethod.Post)
            allowMethod(HttpMethod.Put)
            allowMethod(HttpMethod.Delete)
        }
        foodRoutes()
        entryRoutes()
        summaryRoutes()
    }.start(wait = true)
}
```

Entry point that initialises the database, configures CORS and JSON content negotiation, then starts the Netty server on port 3001.

```kotlin
// FILE: backend/src/main/kotlin/com/app/DatabaseFactory.kt
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
```

Singleton that connects to SQLite, creates missing tables, and seeds three sample foods and meal entries on first run.

```kotlin
// FILE: backend/src/main/kotlin/com/app/models/Food.kt
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
```

Defines the `foods` Exposed table object and the serializable `Food` response model.

```kotlin
// FILE: backend/src/main/kotlin/com/app/models/MealEntry.kt
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
```

Defines the `meal_entries` table schema and all serializable request/response models for entries.

```kotlin
// FILE: backend/src/main/kotlin/com/app/routes/FoodRoutes.kt
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

@Serializable
private data class ErrorResponse(val error: String)

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
```

Registers `GET /api/foods` (search by name) and `GET /api/foods/{id}` routes.

```kotlin
// FILE: backend/src/main/kotlin/com/app/routes/EntryRoutes.kt
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

@Serializable
private data class ErrorResponse(val error: String)

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
```

Registers `GET /api/entries`, `POST /api/entries`, `PUT /api/entries/{id}`, and `DELETE /api/entries/{id}` routes.

```kotlin
// FILE: backend/src/main/kotlin/com/app/routes/SummaryRoutes.kt
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

@Serializable
private data class ErrorResponse(val error: String)

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
```

Registers `GET /api/summary`, computing aggregated daily nutrition totals and a per-meal breakdown for the requested date.
