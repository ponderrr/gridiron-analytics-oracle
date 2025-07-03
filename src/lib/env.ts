export interface EnvironmentVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

const requiredEnvVars: (keyof EnvironmentVariables)[] = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

export function validateEnvironment(): EnvironmentVariables {
  const missing: string[] = [];
  const env = {} as EnvironmentVariables;

  for (const key of requiredEnvVars) {
    const value = import.meta.env[key];
    if (!value) {
      missing.push(key);
    } else {
      env[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return env;
}
