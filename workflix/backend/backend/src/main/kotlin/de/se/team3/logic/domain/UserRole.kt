package de.se.team3.logic.domain

import de.se.team3.logic.container.ProcessTemplatesContainer
import de.se.team3.logic.exceptions.AlreadyExistsException
import de.se.team3.logic.exceptions.InvalidInputException
import de.se.team3.logic.exceptions.NotFoundException
import java.time.Instant
import kotlin.NullPointerException
import org.json.JSONArray
import org.json.JSONObject

data class UserRole(
    val id: Int?,
    private var name: String,
    private var description: String,
    val createdAt: Instant,
    private var deleted: Boolean,
    private val members: MutableList<User>
) {

    fun getName() = name

    fun getDescription() = description

    fun isDeleted() = deleted

    fun getMembers() = members

    /**
     * Create-Constructor
     */
    constructor(name: String, description: String) :
        this(null, name, description, Instant.now(), false, ArrayList<User>()) {

        if (name.isEmpty())
            throw InvalidInputException("name must not be empty")
    }

    /**
     * Update-Constructor
     */
    constructor(id: Int, name: String, description: String) :
            this(id, name, description, Instant.now(), false, ArrayList<User>()) {

        if (name.isEmpty())
            throw InvalidInputException("name must not be empty")
    }

    /**
     * Sets the name of this user role.
     *
     * @throws InvalidInputException Is thrown if the given name is empty.
     */
    fun setName(name: String) {
        if (name.isEmpty())
            throw InvalidInputException("name must not be empty")

        this.name = name
    }

    /**
     * Sets the description of this user role.
     */
    fun setDescription(description: String) {
        this.description = description
    }

    /**
     * Sets the deleted flag.
     */
    fun delete() {
        deleted = true
    }

    /**
     * Checks whether there is an active (not deleted) process template which has
     * an task template that refers to this user role.
     *
     * This method is used to decide whether a user role could be deleted or not.
     *
     * @throws NullPointerException Is thrown if id is null because id must not be null to
     * do the calculations in ProcessTemplatesContainer.
     *
     * @return True if and only if the user role is not used in any active process template.
     */
    fun isUsedInActiveProcessTemplate(): Boolean {
        if (id == null)
            throw NullPointerException("must not be called in a state where id is null")

        return ProcessTemplatesContainer.hasProcessTemplateUsingUserRole(this)
    }

    /**
     * Checks whether the specified user is a member of this group.
     *
     * @return True if and only if the user is member of this group.
     */
    fun hasMember(memberId: String): Boolean {
        return members.find { it.id == memberId } != null
    }

    /**
     * Adds the given member.
     *
     * @throws AlreadyExistsException Is thrown if the given user is already a member of this user role.
     */
    fun addMember(user: User) {
        if (hasMember(user.id))
            throw AlreadyExistsException("the given user is already a member of this user role")

        members.add(user)
    }

    /**
     * Removes the specified member.
     *
     * @throws NotFoundException Is thrown if the specified member does not exist.
     */
    fun removeMember(memberId: String) {
        val existed = members.removeIf { it.id == memberId }
        if (!existed)
            throw NotFoundException("member does not exist")
    }

    fun toJSON(): JSONObject {
        val json = JSONObject()
        json.put("id", this.id)
        json.put("name", this.name)
        json.put("description", this.description)
        json.put("createdAt", this.createdAt)
        json.put("memberIds", JSONArray(members.map { it.id }))
        return json
    }
}
