package de.se.team3.logic.domain

import java.time.Instant

data class UserRole(
    var id: Int,
    var name: String,
    var description: String,
    val createdAt: Instant,
    val members: List<User>
) {
    constructor(name: String, description: String) :
        this(0, name, description, Instant.now(), ArrayList<User>())
}
