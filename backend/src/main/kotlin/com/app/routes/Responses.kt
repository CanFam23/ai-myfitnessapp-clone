package com.app.routes

import kotlinx.serialization.Serializable

@Serializable
internal data class ErrorResponse(val error: String)
