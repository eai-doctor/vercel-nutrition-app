function getBase(path, envVar, localFallback) {

  console.log("import.meta.env.DEV", import.meta.env.DEV);
  if (import.meta.env.DEV) {
    return localFallback.replace(/\/$/, "");
  }
  if (envVar) {
    return envVar.replace(/\/$/, "");
  }
  return path.replace(/\/$/, "");
}

const config = {
  nutritionUrl: getBase("/api",  import.meta.env.VITE_NUTRITION_URL, "/api"),
};

export default config;
