import { cache } from "react";
import db from "./drizzle";

export const getCourses = cache(async () => { // will cache response for any calls made in any other component
  const data = await db.query.courses.findMany();
  return data;
});
