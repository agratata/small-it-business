import { supabase } from "./supabaseClient";

const FREE_EMAIL_PROVIDERS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];

export function isUniversityEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return email.includes("@") && domain.includes(".") && !FREE_EMAIL_PROVIDERS.includes(domain);
}

// Creates an auth user AND, via the DB trigger in the schema, a matching
// row in `profiles` with the name/role passed in metadata.
export async function signUp({ fullName, email, password, role }) {
  if (!isUniversityEmail(email)) {
    return { error: { message: "Use your university email address, not a personal one." } };
  }
  const institution = await findInstitutionByEmail(email)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role, // "student" or "lecturer"
        institution_id: institution?.id ?? null,
      },
    },
  });

  return { data, error };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Call this once when your app loads to pick up an existing session,
// and subscribe to future auth changes (login/logout in another tab, etc).
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
