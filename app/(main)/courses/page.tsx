import { getCourses, getUserProgress } from "@/db/queries";
import { List } from "./list";
import { courses } from "@/db/schema";

export const sortCourses = (courseList: typeof courses.$inferSelect[]) => {
  return [...courseList].sort((a, b) => a.title.localeCompare(b.title));
}

const CoursesPage = async () => {
  const getCoursesPromise = getCourses();
  const getUserProgressPromise = getUserProgress();

  const [ courses, userProgress ] = await Promise.all([
    getCoursesPromise,
    getUserProgressPromise,
  ]);

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto ">
      <h1 className="text-2xl font-bold text-neutral-700">
        Language Courses
      </h1>
      <List
        courses={sortCourses(courses)}
        activeCourseId={userProgress?.activeCourseId}
      />
    </div>
  );
};

export default CoursesPage;