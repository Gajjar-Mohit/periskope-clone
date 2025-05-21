import { createClient } from "./client"

// Function to ensure a user exists in the users table
export async function ensureUserExists(userId: string, email: string, fullName: string) {
  const supabase = createClient();

  try {
    console.log("Ensuring user exists:", userId)

    // Check if user exists
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // Record not found
        console.log("User not found, creating:", userId)

        // Create the user
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: userId,
            email: email || `user-${userId}@example.com`,
            full_name: fullName || `User ${userId.substring(0, 8)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error creating user:", insertError)
          throw insertError
        }

        console.log("User created successfully:", userId)
        return newUser
      } else {
        throw error
      }
    } else {
      console.log("User already exists:", userId)
      return data
    }
  } catch (error) {
    console.error("Error in ensureUserExists:", error)
    throw error
  }
}
