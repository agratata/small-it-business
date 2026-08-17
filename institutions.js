import { supabase } from "./supabaseClient";


/** "AGRATA@Student.Swinburne.edu.au " -> "student.swinburne.edu.au" */
export function domainFromEmail(email) {
  if (typeof email !== "string") return null;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[1]) return null;
  return parts[1];
}

/**
 * "student.swinburne.edu.au"
 *   -> ["student.swinburne.edu.au", "swinburne.edu.au", "edu.au"]
 * Most specific first. Stops at two labels so we never try to match "au".
 */
export function domainCandidates(domain) {
  if (!domain) return [];
  const labels = domain.split(".");
  const candidates = [];
  for (let i = 0; i <= labels.length - 2; i++) {
    candidates.push(labels.slice(i).join("."));
  }
  return candidates;
}

/**
 * Look up the institution for an email address.
 * Returns the institution row, or null if no institution matches.
 */
export async function findInstitutionByEmail(email) {
  const candidates = domainCandidates(domainFromEmail(email));
  if (candidates.length === 0) return null;

  const { data, error } = await supabase
    .from("institutions")
    .select("id, name, email_domain, plan, subscription_ends")
    .in("email_domain", candidates);

  if (error) {
    console.error("Could not look up institution:", error.message);
    return null;
  }
  if (!data || data.length === 0) return null;

  // candidates is ordered most specific first, so the first hit wins
  for (const candidate of candidates) {
    const match = data.find((row) => row.email_domain === candidate);
    if (match) return match;
  }
  return null;
}

/** Has this institution's subscription expired? */
export function isSubscriptionActive(institution) {
  if (!institution || !institution.subscription_ends) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(institution.subscription_ends) >= today;
}

/** The institution attached to the signed-in user, or null. */
export async function getMyInstitution() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("institution_id, institutions(id, name, email_domain, plan, subscription_ends)")
    .eq("id", auth.user.id)
    .single();

  if (error) {
    console.error("Could not load your institution:", error.message);
    return null;
  }
  return data?.institutions ?? null;
}

/** Friendly label for the UI, e.g. "Swinburne University of Technology · Annual" */
export function institutionLabel(institution) {
  if (!institution) return "No institution";
  const plans = { pilot: "Pilot", annual: "Annual", triennial: "3-year" };
  return `${institution.name} · ${plans[institution.plan] ?? institution.plan}`;
}