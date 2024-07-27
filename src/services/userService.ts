import { GoogleUser } from "@/app/api/login/google/callback/route";
import { createAccountViaGoogle } from "@/repositories/accounts";
import { createUser, getUserByEmail } from "@/repositories/users";

export async function createGoogleUser(googleUser: GoogleUser) {
  let existingUser = await getUserByEmail(googleUser.email);

  if (!existingUser) {
    existingUser = await createUser({ email: googleUser.email, name: googleUser.name, image: googleUser.picture });
  }

  await createAccountViaGoogle(existingUser.id, googleUser.sub);

  return existingUser;
}
